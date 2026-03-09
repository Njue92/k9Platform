from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Reminder, BreedingRecord, TrainingRecord, Deployment, Notification
from datetime import datetime


def send_websocket_notification(user_id, notification_type, title, message, data=None):
    """Helper function to send notification to user's WebSocket"""
    try:
        # Import here to avoid circular imports during app initialization
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer

        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'user_{user_id}',
                {
                    'type': 'notification_message',
                    'data': {
                        'notification_type': notification_type,
                        'title': title,
                        'message': message,
                        'data': data or {},
                        'timestamp': datetime.now().isoformat()
                    }
                }
            )
    except Exception:
        # Silently fail if WebSocket is not available
        pass


@receiver(post_save, sender=Reminder)
def create_reminder_notification(sender, instance, created, **kwargs):
    """Create notification when a reminder is created"""
    if created:
        Notification.objects.create(
            user=instance.user,
            title=f"New Reminder: {instance.title}",
            message=instance.description[:100] if instance.description else "You have a new reminder",
            notification_type='reminder',
            link=f"/reminders/{instance.id}"
        )
        send_websocket_notification(
            instance.user.id,
            'reminder_created',
            'New Reminder',
            f'Reminder created: {instance.title}',
            {
                'reminder_id': instance.id,
                'due_date': instance.due_date.isoformat() if instance.due_date else None,
                'priority': instance.priority
            }
        )


@receiver(post_save, sender=BreedingRecord)
def create_breeding_notification(sender, instance, created, **kwargs):
    """Create notification when a breeding record is created"""
    if created:
        Notification.objects.create(
            user=instance.dog.owner,
            title=f"New Breeding Record: {instance.dog.name}",
            message=f"Breeding record created for {instance.dog.name} on {instance.mating_date}",
            notification_type='breeding',
            link=f"/breeding/{instance.id}"
        )
        send_websocket_notification(
            instance.dog.owner.id,
            'breeding_created',
            'New Breeding Record',
            f'Breeding record created for {instance.dog.name}',
            {
                'breeding_id': instance.id,
                'mating_date': instance.mating_date.isoformat() if instance.mating_date else None,
                'dog_name': instance.dog.name
            }
        )


@receiver(post_save, sender=TrainingRecord)
def create_training_notification(sender, instance, created, **kwargs):
    """Create notification when a training record is created"""
    if created:
        Notification.objects.create(
            user=instance.dog.owner,
            title=f"Training Record: {instance.dog.name}",
            message=f"New {instance.training_type} training recorded for {instance.dog.name}",
            notification_type='training',
            link=f"/training/{instance.id}"
        )
        send_websocket_notification(
            instance.dog.owner.id,
            'training_created',
            'New Training Session',
            f'Training session recorded for {instance.dog.name}',
            {
                'training_id': instance.id,
                'dog_name': instance.dog.name,
                'training_type': instance.training_type,
                'start_date': instance.start_date.isoformat() if instance.start_date else None
            }
        )


@receiver(post_save, sender=Deployment)
def create_deployment_notification(sender, instance, created, **kwargs):
    """Create notification when a deployment is created"""
    if created:
        Notification.objects.create(
            user=instance.dog.owner,
            title=f"New Deployment: {instance.dog.name}",
            message=f"{instance.dog.name} deployed to {instance.site} for {instance.job_type}",
            notification_type='deployment',
            link=f"/deployments/{instance.id}"
        )
        send_websocket_notification(
            instance.dog.owner.id,
            'deployment_created',
            'New Deployment',
            f'{instance.dog.name} deployed to {instance.site}',
            {
                'deployment_id': instance.id,
                'dog_name': instance.dog.name,
                'site': instance.site,
                'start_date': instance.start_date.isoformat() if instance.start_date else None
            }
        )




# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from asgiref.sync import async_to_sync
# from channels.layers import get_channel_layer
# from .models import Reminder, BreedingRecord, TrainingRecord, Deployment, Notification
# from datetime import datetime
#
#
# def send_websocket_notification(user_id, notification_type, title, message, data=None):
#     """Helper function to send notification to user's WebSocket"""
#     try:
#         channel_layer = get_channel_layer()
#         if channel_layer:
#             async_to_sync(channel_layer.group_send)(
#                 f'user_{user_id}',
#                 {
#                     'type': 'notification_message',
#                     'data': {
#                         'notification_type': notification_type,
#                         'title': title,
#                         'message': message,
#                         'data': data or {},
#                         'timestamp': datetime.now().isoformat()
#                     }
#                 }
#             )
#     except Exception:
#         # Silently fail if WebSocket is not available
#         pass
#
#
# @receiver(post_save, sender=Reminder)
# def create_reminder_notification(sender, instance, created, **kwargs):
#     """Create notification when a reminder is created"""
#     if created:
#         Notification.objects.create(
#             user=instance.user,
#             title=f"New Reminder: {instance.title}",
#             message=instance.description[:100] if instance.description else "You have a new reminder",
#             notification_type='reminder',
#             link=f"/reminders/{instance.id}"
#         )
#         send_websocket_notification(
#             instance.user.id,
#             'reminder_created',
#             'New Reminder',
#             f'Reminder created: {instance.title}',
#             {
#                 'reminder_id': instance.id,
#                 'due_date': instance.due_date.isoformat() if instance.due_date else None,
#                 'priority': instance.priority
#             }
#         )
#
#
# @receiver(post_save, sender=BreedingRecord)
# def create_breeding_notification(sender, instance, created, **kwargs):
#     """Create notification when a breeding record is created"""
#     if created:
#         Notification.objects.create(
#             user=instance.dog.owner,
#             title=f"New Breeding Record: {instance.dog.name}",
#             message=f"Breeding record created for {instance.dog.name} on {instance.mating_date}",
#             notification_type='breeding',
#             link=f"/breeding/{instance.id}"
#         )
#         send_websocket_notification(
#             instance.dog.owner.id,
#             'breeding_created',
#             'New Breeding Record',
#             f'Breeding record created for {instance.dog.name}',
#             {
#                 'breeding_id': instance.id,
#                 'mating_date': instance.mating_date.isoformat() if instance.mating_date else None,
#                 'dog_name': instance.dog.name
#             }
#         )
#
#
# @receiver(post_save, sender=TrainingRecord)
# def create_training_notification(sender, instance, created, **kwargs):
#     """Create notification when a training record is created"""
#     if created:
#         Notification.objects.create(
#             user=instance.dog.owner,
#             title=f"Training Record: {instance.dog.name}",
#             message=f"New {instance.training_type} training recorded for {instance.dog.name}",
#             notification_type='training',
#             link=f"/training/{instance.id}"
#         )
#         send_websocket_notification(
#             instance.dog.owner.id,
#             'training_created',
#             'New Training Session',
#             f'Training session recorded for {instance.dog.name}',
#             {
#                 'training_id': instance.id,
#                 'dog_name': instance.dog.name,
#                 'training_type': instance.training_type,
#                 'start_date': instance.start_date.isoformat() if instance.start_date else None
#             }
#         )
#
#
# @receiver(post_save, sender=Deployment)
# def create_deployment_notification(sender, instance, created, **kwargs):
#     """Create notification when a deployment is created"""
#     if created:
#         Notification.objects.create(
#             user=instance.dog.owner,
#             title=f"New Deployment: {instance.dog.name}",
#             message=f"{instance.dog.name} deployed to {instance.site} for {instance.job_type}",
#             notification_type='deployment',
#             link=f"/deployments/{instance.id}"
#         )
#         send_websocket_notification(
#             instance.dog.owner.id,
#             'deployment_created',
#             'New Deployment',
#             f'{instance.dog.name} deployed to {instance.site}',
#             {
#                 'deployment_id': instance.id,
#                 'dog_name': instance.dog.name,
#                 'site': instance.site,
#                 'start_date': instance.start_date.isoformat() if instance.start_date else None
#             }
#         )
