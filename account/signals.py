def create_user_mentorship(sender, instance, created, **kwargs):
    """
    Local import to avoid circular import with models
    """
    from .models import Mentorship
    if created:
        Mentorship.objects.create(user=instance)
