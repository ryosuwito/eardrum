from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


user_list = [
    'htan',
    'zban',
    'doan',
    'htao',
    'jmiao',
    'ysheng',
    'yliu',
    'myang',
    'yzhou',
    'hlang',
    'fzhao',
    'ftang',
    'lai',
    'ynguyen',
    'ylv',
    'ykong',
    'ylian',
    'mhoang',
    'tnguyen',
    'slee',
    'xxiang',
    'tma',
    'lqin',
    'dvu',
    'xzhao',
    'hyu',
    'msong',
    'xzhuo',
    'jfu',
    'fyang',
    'swang',
    'ado',
    'tpham',
    'trnguyen',
    'hfu',
    'hpham',
    'glau',
    'qdung',
    'wang',
    'yzhu',
    'ywang',
    'jliu',
    'nkho',
    'azhang',
    'zqiu',
    'schen',
    'mlai',
    'hwu',
    'lhe',
    'yhua',
    'akumar',
    'llu',
]

class Command(BaseCommand):
    help = 'Load user list'

    def handle(self, *args, **kwargs):
        self.stdout.write('=== Load users ===')
        for username in user_list:
            user = User(username=username, password='')
            try:
                user.save()
            except Exception as err:
                self.stdout.write(self.style.ERROR(err))
            else:
                self.stdout.write(self.style.SUCCESS('User {} has added successfully!'.format(username)))
