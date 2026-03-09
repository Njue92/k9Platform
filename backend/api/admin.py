from django.contrib import admin
from .models import *


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'organization', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['user__username', 'user__email', 'organization']


@admin.register(Dog)
class DogAdmin(admin.ModelAdmin):
    list_display = ['name', 'breed', 'gender', 'date_of_birth', 'owner', 'status']
    list_filter = ['breed', 'gender', 'status', 'created_at']
    search_fields = ['name', 'breed', 'registration_number', 'microchip_number']


@admin.register(HealthRecord)
class HealthRecordAdmin(admin.ModelAdmin):
    list_display = ['dog', 'type', 'date', 'vet_name']
    list_filter = ['type', 'date']
    search_fields = ['dog__name', 'type', 'description']


@admin.register(GeneticTest)
class GeneticTestAdmin(admin.ModelAdmin):
    list_display = ['dog', 'test_name', 'test_date', 'result']
    list_filter = ['test_date', 'result']
    search_fields = ['dog__name', 'test_name']


@admin.register(BreedingRecord)
class BreedingRecordAdmin(admin.ModelAdmin):
    list_display = ['dog', 'partner', 'mating_date', 'pregnancy_confirmed']
    list_filter = ['mating_date', 'pregnancy_confirmed']
    search_fields = ['dog__name', 'partner__name']


@admin.register(Litter)
class LitterAdmin(admin.ModelAdmin):
    list_display = ['litter_id', 'birth_date', 'total_puppies', 'males', 'females']
    list_filter = ['birth_date']
    search_fields = ['litter_id']


@admin.register(Puppy)
class PuppyAdmin(admin.ModelAdmin):
    list_display = ['name', 'litter', 'gender', 'status', 'sale_price']
    list_filter = ['gender', 'status']
    search_fields = ['name', 'litter__litter_id', 'buyer_name']


@admin.register(TrainingRecord)
class TrainingRecordAdmin(admin.ModelAdmin):
    list_display = ['dog', 'training_type', 'level', 'start_date', 'handler']
    list_filter = ['training_type', 'level', 'start_date']
    search_fields = ['dog__name', 'handler', 'training_type']


@admin.register(BehaviorAssessment)
class BehaviorAssessmentAdmin(admin.ModelAdmin):
    list_display = ['dog', 'assessment_date', 'assessor', 'sociability', 'energy_level']
    list_filter = ['assessment_date']
    search_fields = ['dog__name', 'assessor']


@admin.register(Deployment)
class DeploymentAdmin(admin.ModelAdmin):
    list_display = ['dog', 'site', 'job_type', 'start_date', 'end_date', 'handler']
    list_filter = ['job_type', 'start_date']
    search_fields = ['dog__name', 'site', 'handler']


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['dog', 'item_name', 'item_type', 'purchase_date', 'cost']
    list_filter = ['item_type', 'purchase_date']
    search_fields = ['dog__name', 'item_name']


@admin.register(FinancialRecord)
class FinancialRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'dog', 'transaction_type', 'category', 'amount', 'date']
    list_filter = ['transaction_type', 'category', 'date']
    search_fields = ['user__username', 'dog__name', 'description']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['dog', 'title', 'document_type', 'upload_date']
    list_filter = ['document_type', 'upload_date']
    search_fields = ['dog__name', 'title']


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ['user', 'dog', 'title', 'due_date', 'priority', 'completed']
    list_filter = ['priority', 'completed', 'due_date']
    search_fields = ['user__username', 'dog__name', 'title']
