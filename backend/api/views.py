from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from django.conf import settings
from datetime import datetime, timedelta
from .models import *
from .serializers import *
from .permissions import (
    IsOwnerOrReadOnly, IsSuperAdmin,
    IsBreederOrSuperAdmin, IsTrainerOrSuperAdmin,
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user with role (breeder/trainer)
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.profile.role
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user and return JWT tokens
    Accepts username or email
    """
    username_or_email = request.data.get('username')
    password = request.data.get('password')

    # Try to find user by username or email
    try:
        user_obj = User.objects.get(Q(username=username_or_email) | Q(email=username_or_email))
        user = authenticate(username=user_obj.username, password=password)
    except User.DoesNotExist:
        user = None

    if user:
        # Auto-create profile for Django superusers created via createsuperuser
        if not hasattr(user, 'profile') or not UserProfile.objects.filter(user=user).exists():
            role = 'superadmin' if user.is_superuser else 'breeder'
            UserProfile.objects.create(user=user, role=role)
            user.refresh_from_db()
        elif user.is_superuser and user.profile.role != 'superadmin':
            # Ensure Django superusers always get superadmin role
            user.profile.role = 'superadmin'
            user.profile.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.profile.role
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })

    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user profile
    """
    serializer = UserProfileSerializer(request.user.profile)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics based on user role
    """
    user = request.user
    role = user.profile.role

    stats = {}

    # Common stats
    stats['total_dogs'] = Dog.objects.filter(owner=user).count()
    stats['active_dogs'] = Dog.objects.filter(owner=user, status='active').count()

    # Financial stats
    thirty_days_ago = datetime.now().date() - timedelta(days=30)
    income = FinancialRecord.objects.filter(
        user=user,
        transaction_type='income',
        date__gte=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0

    expenses = FinancialRecord.objects.filter(
        user=user,
        transaction_type='expense',
        date__gte=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0

    stats['monthly_income'] = float(income)
    stats['monthly_expenses'] = float(expenses)
    stats['monthly_profit'] = float(income - expenses)

    # Role-specific stats
    if role == 'breeder':
        stats['total_litters'] = Litter.objects.filter(
            breeding_record__dog__owner=user
        ).count()

        stats['available_puppies'] = Puppy.objects.filter(
            litter__breeding_record__dog__owner=user,
            status='available'
        ).count()

        stats['breeding_females'] = Dog.objects.filter(
            owner=user,
            gender='female',
            status='active'
        ).count()

    elif role == 'trainer':
        stats['total_deployments'] = Deployment.objects.filter(
            dog__owner=user
        ).count()

        stats['active_deployments'] = Deployment.objects.filter(
            dog__owner=user,
            end_date__isnull=True
        ).count()

        stats['certified_dogs'] = TrainingRecord.objects.filter(
            dog__owner=user,
            level='operational'
        ).values('dog').distinct().count()

    # Equipment count
    stats['equipment_count'] = Equipment.objects.filter(user=user).count()

    # Recent reminders
    upcoming_reminders = Reminder.objects.filter(
        user=user,
        completed=False,
        due_date__gte=datetime.now().date()
    ).order_by('due_date')[:5]

    stats['upcoming_reminders'] = ReminderSerializer(upcoming_reminders, many=True).data

    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    """
    Get user notifications
    """
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    """
    Mark a notification as read
    """
    try:
        notification = Notification.objects.get(pk=pk, user=request.user)
        notification.read = True
        notification.save()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """
    Mark all notifications as read
    """
    Notification.objects.filter(user=request.user, read=False).update(read=True)
    return Response({'status': 'success'})


class DogViewSet(viewsets.ModelViewSet):
    serializer_class = DogSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        # Superadmins see all dogs
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return Dog.objects.all()
        return Dog.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PublicDogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only access to dogs. Excludes sensitive fields.
    Supports ?owner_role=breeder|trainer filtering.
    """
    serializer_class = PublicDogSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Dog.objects.filter(status='active').select_related('owner__profile').prefetch_related('training_records')
        role = self.request.query_params.get('owner_role')
        if role in ('breeder', 'trainer'):
            qs = qs.filter(owner__profile__role=role)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class HealthRecordViewSet(viewsets.ModelViewSet):
    serializer_class = HealthRecordSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return HealthRecord.objects.all()
        return HealthRecord.objects.filter(dog__owner=user)


class GeneticTestViewSet(viewsets.ModelViewSet):
    serializer_class = GeneticTestSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return GeneticTest.objects.all()
        return GeneticTest.objects.filter(dog__owner=user)


class BreedingRecordViewSet(viewsets.ModelViewSet):
    serializer_class = BreedingRecordSerializer
    permission_classes = [IsAuthenticated, IsBreederOrSuperAdmin, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return BreedingRecord.objects.all()
        return BreedingRecord.objects.filter(dog__owner=user)


class LitterViewSet(viewsets.ModelViewSet):
    serializer_class = LitterSerializer
    permission_classes = [IsAuthenticated, IsBreederOrSuperAdmin, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return Litter.objects.all()
        return Litter.objects.filter(breeding_record__dog__owner=user)


class PuppyViewSet(viewsets.ModelViewSet):
    serializer_class = PuppySerializer
    permission_classes = [IsAuthenticated, IsBreederOrSuperAdmin, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return Puppy.objects.all()
        return Puppy.objects.filter(litter__breeding_record__dog__owner=user)


class TrainingRecordViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingRecordSerializer
    permission_classes = [IsAuthenticated, IsTrainerOrSuperAdmin, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return TrainingRecord.objects.all()
        return TrainingRecord.objects.filter(dog__owner=user)


class BehaviorAssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = BehaviorAssessmentSerializer
    permission_classes = [IsAuthenticated, IsTrainerOrSuperAdmin, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return BehaviorAssessment.objects.all()
        return BehaviorAssessment.objects.filter(dog__owner=user)


class DeploymentViewSet(viewsets.ModelViewSet):
    serializer_class = DeploymentSerializer
    permission_classes = [IsAuthenticated, IsTrainerOrSuperAdmin, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return Deployment.objects.all()
        return Deployment.objects.filter(dog__owner=user)


class EquipmentViewSet(viewsets.ModelViewSet):
    serializer_class = EquipmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return Equipment.objects.all()
        return Equipment.objects.filter(Q(user=user) | Q(dog__owner=user))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FinancialRecordViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return FinancialRecord.objects.all()
        return FinancialRecord.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get financial dashboard data"""
        queryset = self.get_queryset()

        # Get date range from query params (default to last 6 months)
        months = int(request.query_params.get('months', 6))
        start_date = datetime.now().date() - timedelta(days=months * 30)

        records = queryset.filter(date__gte=start_date)

        # Monthly breakdown
        monthly_data = []
        for i in range(months):
            month_start = start_date + timedelta(days=i * 30)
            month_end = month_start + timedelta(days=30)

            month_records = records.filter(date__gte=month_start, date__lt=month_end)
            income = month_records.filter(transaction_type='income').aggregate(Sum('amount'))['amount__sum'] or 0
            expenses = month_records.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0

            monthly_data.append({
                'month': month_start.strftime('%B %Y'),
                'income': float(income),
                'expenses': float(expenses),
                'profit': float(income - expenses)
            })

        # Category breakdown
        category_data = []
        for category, label in FinancialRecord.CATEGORY_CHOICES:
            total = records.filter(category=category).aggregate(Sum('amount'))['amount__sum'] or 0
            if total > 0:
                category_data.append({
                    'category': label,
                    'total': float(total)
                })

        return Response({
            'monthly_data': monthly_data,
            'category_data': category_data
        })


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return Document.objects.all()
        return Document.objects.filter(dog__owner=user)


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'superadmin'):
            return Reminder.objects.all()
        return Reminder.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ─── Superadmin Views ───────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_stats(request):
    """Platform-wide stats for superadmin dashboard."""
    return Response({
        'total_users': User.objects.count(),
        'total_breeders': UserProfile.objects.filter(role='breeder').count(),
        'total_trainers': UserProfile.objects.filter(role='trainer').count(),
        'total_superadmins': UserProfile.objects.filter(role='superadmin').count(),
        'total_dogs': Dog.objects.count(),
        'total_breeding_records': BreedingRecord.objects.count(),
        'total_training_records': TrainingRecord.objects.count(),
        'total_equipment': Equipment.objects.count(),
        'total_litters': Litter.objects.count(),
        'total_deployments': Deployment.objects.count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_users_list(request):
    """List all users with profiles."""
    users = User.objects.select_related('profile').all().order_by('-date_joined')
    data = []
    for u in users:
        role = u.profile.role if hasattr(u, 'profile') else 'unknown'
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'role': role,
            'is_active': u.is_active,
            'date_joined': u.date_joined.isoformat(),
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_create_user(request):
    """Create a user with a specified role (superadmin can assign any role)."""
    serializer = AdminCreateUserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.profile.role,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_update_user(request, pk):
    """Update user details / role / active status."""
    try:
        target = User.objects.select_related('profile').get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    data = request.data
    if 'first_name' in data:
        target.first_name = data['first_name']
    if 'last_name' in data:
        target.last_name = data['last_name']
    if 'email' in data:
        target.email = data['email']
    if 'is_active' in data:
        target.is_active = data['is_active']
    target.save()

    if 'role' in data and hasattr(target, 'profile'):
        target.profile.role = data['role']
        target.profile.save()

    return Response({'status': 'updated'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_delete_user(request, pk):
    """Delete a user."""
    try:
        target = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    if target == request.user:
        return Response({'error': 'Cannot delete yourself'}, status=400)

    target.delete()
    return Response({'status': 'deleted'}, status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_breeding_records(request):
    """All breeding records across the platform."""
    records = BreedingRecord.objects.select_related('dog__owner', 'partner').all()
    serializer = BreedingRecordSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_training_records(request):
    """All training records across the platform."""
    records = TrainingRecord.objects.select_related('dog__owner').all()
    serializer = TrainingRecordSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def admin_equipment(request):
    """All equipment across the platform."""
    items = Equipment.objects.select_related('user', 'dog').all()
    serializer = EquipmentSerializer(items, many=True)
    return Response(serializer.data)
