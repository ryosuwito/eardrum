from django.core.management.base import BaseCommand
from leave.utils import notify_leave_to_all

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
       return notify_leave_to_all.handle()