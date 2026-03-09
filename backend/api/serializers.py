from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role')
        username = validated_data['username']
        email = validated_data['email']

        # Ensure uniqueness
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({'username': 'Username already exists'})
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'Email already exists'})

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )

        # Ensure UserProfile is always created
        UserProfile.objects.create(user=user, role=role)
        return user


class DogSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    age = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Dog
        fields = '__all__'
        read_only_fields = ['owner']

    def get_age(self, obj):
        from datetime import date
        today = date.today()
        age = today.year - obj.date_of_birth.year
        if today.month < obj.date_of_birth.month or (
                today.month == obj.date_of_birth.month and today.day < obj.date_of_birth.day):
            age -= 1
        return age

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class PublicTrainingRecordSerializer(serializers.ModelSerializer):
    """Limited training info for public display."""

    class Meta:
        model = TrainingRecord
        fields = ['training_type', 'level', 'certification']


class PublicDogSerializer(serializers.ModelSerializer):
    """
    Serializer for public/unauthenticated access.
    Excludes sensitive fields: microchip, registration, internal notes, vet details, financials.
    """
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    owner_mobile = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    training_records = PublicTrainingRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Dog
        fields = [
            'id', 'name', 'breed', 'gender', 'date_of_birth', 'color',
            'markings', 'status', 'image', 'image_url', 'age', 'owner_name',
            'owner_mobile', 'training_records',
        ]

    def get_owner_mobile(self, obj):
        try:
            return obj.owner.profile.mobile_number or ''
        except Exception:
            return ''

    def get_age(self, obj):
        from datetime import date
        today = date.today()
        age = today.year - obj.date_of_birth.year
        if today.month < obj.date_of_birth.month or (
                today.month == obj.date_of_birth.month and today.day < obj.date_of_birth.day):
            age -= 1
        return age

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class HealthRecordSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True)

    class Meta:
        model = HealthRecord
        fields = '__all__'


class GeneticTestSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True)

    class Meta:
        model = GeneticTest
        fields = '__all__'


class BreedingRecordSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True)
    partner_name = serializers.CharField(source='partner.name', read_only=True)

    class Meta:
        model = BreedingRecord
        fields = '__all__'


class PuppySerializer(serializers.ModelSerializer):
    litter_id = serializers.CharField(source='litter.litter_id', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Puppy
        fields = '__all__'

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class LitterSerializer(serializers.ModelSerializer):
    puppies = PuppySerializer(many=True, read_only=True)
    sire_name = serializers.CharField(source='breeding_record.dog.name', read_only=True)
    dam_name = serializers.CharField(source='breeding_record.partner.name', read_only=True)

    class Meta:
        model = Litter
        fields = '__all__'


class TrainingRecordSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True)

    class Meta:
        model = TrainingRecord
        fields = '__all__'


class BehaviorAssessmentSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True)

    class Meta:
        model = BehaviorAssessment
        fields = '__all__'


class DeploymentSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True)

    class Meta:
        model = Deployment
        fields = '__all__'


class EquipmentSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True, allow_null=True)
    owner_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = '__all__'
        read_only_fields = ['user']

    def get_owner_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        if obj.dog:
            return obj.dog.owner.get_full_name() or obj.dog.owner.username
        return ''

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class AdminCreateUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, default='')
    last_name = serializers.CharField(required=False, default='')
    role = serializers.ChoiceField(choices=['breeder', 'trainer', 'admin', 'superadmin'])

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
        return value

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        UserProfile.objects.create(user=user, role=role)
        return user


class FinancialRecordSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True, allow_null=True)

    class Meta:
        model = FinancialRecord
        fields = '__all__'
        read_only_fields = ['user']


class DocumentSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class ReminderSerializer(serializers.ModelSerializer):
    dog_name = serializers.CharField(source='dog.name', read_only=True, allow_null=True)

    class Meta:
        model = Reminder
        fields = '__all__'
        read_only_fields = ['user']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user']
