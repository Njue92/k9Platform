from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

router = DefaultRouter()
router.register(r'dogs', DogViewSet, basename='dog')
router.register(r'public/dogs', PublicDogViewSet, basename='public-dog')
router.register(r'health-records', HealthRecordViewSet, basename='health-record')
router.register(r'genetic-tests', GeneticTestViewSet, basename='genetic-test')
router.register(r'breeding-records', BreedingRecordViewSet, basename='breeding-record')
router.register(r'litters', LitterViewSet, basename='litter')
router.register(r'puppies', PuppyViewSet, basename='puppy')
router.register(r'training-records', TrainingRecordViewSet, basename='training-record')
router.register(r'behavior-assessments', BehaviorAssessmentViewSet, basename='behavior-assessment')
router.register(r'deployments', DeploymentViewSet, basename='deployment')
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'financial-records', FinancialRecordViewSet, basename='financial-record')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'reminders', ReminderViewSet, basename='reminder')

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/profile/', user_profile, name='profile'),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('notifications/', notifications_list, name='notifications-list'),
    path('notifications/<int:pk>/read/', mark_notification_read, name='notification-read'),
    path('notifications/read-all/', mark_all_notifications_read, name='notifications-read-all'),
    # Superadmin endpoints
    path('admin/stats/', admin_stats, name='admin-stats'),
    path('admin/users/', admin_users_list, name='admin-users-list'),
    path('admin/users/create/', admin_create_user, name='admin-create-user'),
    path('admin/users/<int:pk>/', admin_update_user, name='admin-update-user'),
    path('admin/users/<int:pk>/delete/', admin_delete_user, name='admin-delete-user'),
    path('admin/breeding-records/', admin_breeding_records, name='admin-breeding-records'),
    path('admin/training-records/', admin_training_records, name='admin-training-records'),
    path('admin/equipment/', admin_equipment, name='admin-equipment'),
    path('', include(router.urls)),
]
