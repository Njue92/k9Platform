from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('breeder', 'Breeder'),
        ('trainer', 'Trainer'),
        ('admin', 'Admin'),
        ('superadmin', 'Superadmin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)
    mobile_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    organization = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.role}"


class Dog(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('retired', 'Retired'),
        ('sold', 'Sold'),
        ('deceased', 'Deceased'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dogs')
    name = models.CharField(max_length=100)
    breed = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    color = models.CharField(max_length=100)
    markings = models.TextField(blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    microchip_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    image = models.ImageField(upload_to='dogs/', blank=True, null=True)
    sire = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='offspring_as_sire')
    dam = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='offspring_as_dam')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.breed}"


class HealthRecord(models.Model):
    dog = models.ForeignKey(Dog, on_delete=models.CASCADE, related_name='health_records')
    date = models.DateField()
    type = models.CharField(max_length=100)
    description = models.TextField()
    vet_name = models.CharField(max_length=255, blank=True)
    medication = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    next_appointment = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.dog.name} - {self.type} - {self.date}"


class GeneticTest(models.Model):
    dog = models.ForeignKey(Dog, on_delete=models.CASCADE, related_name='genetic_tests')
    test_name = models.CharField(max_length=255)
    test_date = models.DateField()
    result = models.CharField(max_length=100)
    hip_score = models.CharField(max_length=50, blank=True)
    elbow_score = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.dog.name} - {self.test_name}"


class BreedingRecord(models.Model):
    dog = models.ForeignKey(Dog, on_delete=models.CASCADE, related_name='breeding_records')
    partner = models.ForeignKey(Dog, on_delete=models.SET_NULL, null=True, related_name='breeding_partner_records')
    mating_date = models.DateField()
    expected_whelping_date = models.DateField(null=True, blank=True)
    actual_whelping_date = models.DateField(null=True, blank=True)
    pregnancy_confirmed = models.BooleanField(default=False)
    complications = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.dog.name} x {self.partner.name if self.partner else 'Unknown'} - {self.mating_date}"


class Litter(models.Model):
    breeding_record = models.OneToOneField(BreedingRecord, on_delete=models.CASCADE, related_name='litter')
    litter_id = models.CharField(max_length=100, unique=True)
    total_puppies = models.IntegerField()
    males = models.IntegerField()
    females = models.IntegerField()
    birth_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Litter {self.litter_id} - {self.total_puppies} puppies"


class Puppy(models.Model):
    litter = models.ForeignKey(Litter, on_delete=models.CASCADE, related_name='puppies')
    name = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=10, choices=Dog.GENDER_CHOICES)
    birth_weight = models.DecimalField(max_digits=5, decimal_places=2)
    color = models.CharField(max_length=100)
    markings = models.TextField(blank=True)
    microchip_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=50, default='available')
    buyer_name = models.CharField(max_length=255, blank=True)
    buyer_contact = models.CharField(max_length=255, blank=True)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sale_date = models.DateField(null=True, blank=True)
    image = models.ImageField(upload_to='puppies/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name or 'Unnamed'} - {self.litter.litter_id}"


class TrainingRecord(models.Model):
    TRAINING_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('operational', 'Operational'),
    ]

    dog = models.ForeignKey(Dog, on_delete=models.CASCADE, related_name='training_records')
    training_type = models.CharField(max_length=100)
    level = models.CharField(max_length=50, choices=TRAINING_LEVEL_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    handler = models.CharField(max_length=255)
    skills_mastered = models.TextField()
    certification = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.dog.name} - {self.training_type} - {self.level}"


class BehaviorAssessment(models.Model):
    dog = models.ForeignKey(Dog, on_delete=models.CASCADE, related_name='behavior_assessments')
    assessment_date = models.DateField()
    sociability = models.IntegerField(help_text="Scale 1-10")
    energy_level = models.IntegerField(help_text="Scale 1-10")
    prey_drive = models.IntegerField(help_text="Scale 1-10")
    noise_sensitivity = models.IntegerField(help_text="Scale 1-10")
    temperament_notes = models.TextField()
    warnings = models.TextField(blank=True)
    assessor = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.dog.name} - Assessment {self.assessment_date}"


class Deployment(models.Model):
    dog = models.ForeignKey(Dog, on_delete=models.CASCADE, related_name='deployments')
    site = models.CharField(max_length=255)
    job_type = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    duration_days = models.IntegerField(null=True, blank=True)
    handler = models.CharField(max_length=255)
    results = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.dog.name} - {self.site} - {self.start_date}"


class Equipment(models.Model):
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('worn', 'Worn'),
        ('damaged', 'Damaged'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='equipment_inventory', null=True, blank=True)
    dog = models.ForeignKey(Dog, on_delete=models.CASCADE, related_name='equipment', null=True, blank=True)
    item_name = models.CharField(max_length=255)
    item_type = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    purchase_date = models.DateField()
    replacement_date = models.DateField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    image = models.ImageField(upload_to='equipment/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        owner = self.user or (self.dog.owner if self.dog else None)
        return f"{owner} - {self.item_name}"


class FinancialRecord(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    CATEGORY_CHOICES = [
        ('vet', 'Veterinary'),
        ('food', 'Food'),
        ('training', 'Training'),
        ('equipment', 'Equipment'),
        ('stud_fee', 'Stud Fee'),
        ('puppy_sale', 'Puppy Sale'),
        ('deployment_fee', 'Deployment Fee'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='financial_records')
    dog = models.ForeignKey(Dog, on_delete=models.SET_NULL, null=True, blank=True, related_name='financial_records')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.category} - ${self.amount}"


class Document(models.Model):
    dog = models.ForeignKey(Dog, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=100)
    file = models.FileField(upload_to='documents/')
    upload_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.dog.name} - {self.title}"


class Reminder(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    dog = models.ForeignKey(Dog, on_delete=models.CASCADE, null=True, blank=True, related_name='reminders')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.due_date}"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('reminder', 'Reminder'),
        ('breeding', 'Breeding'),
        ('training', 'Training'),
        ('deployment', 'Deployment'),
        ('health', 'Health'),
        ('financial', 'Financial'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='system')
    read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"
