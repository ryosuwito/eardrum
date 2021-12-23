import json

from django.core.management.base import BaseCommand

from review.models import Request
from config.models import Entry


def get_grade_options(value):
    """
    :input A+:105|A:100|A-:95|B+:80|B:75|B-:70|C+:55|C:50|C-:45|D+:30|D:25|D-:20|F:0
    :output [
        {'value': '105', 'name': 'A+'},
        {'value': '100', 'name': 'A'},
        {'value': '95', 'name': 'A-'},
        {'value': '80', 'name': 'B+'},
        {'value': '75', 'name': 'B'},
        {'value': '70', 'name': 'B-'},
        {'value': '55', 'name': 'C+'},
        {'value': '50', 'name': 'C'},
        {'value': '45', 'name': 'C-'},
        {'value': '30', 'name': 'D+'},
        {'value': '25', 'name': 'D'},
        {'value': '20', 'name': 'D-'},
        {'value': '0', 'name': 'F'}]
    """
    default_value = [
        {'value': 0, 'name': 'A+'},
        {'value': 0, 'name': 'A'},
        {'value': 0, 'name': 'A-'},
        {'value': 0, 'name': 'B+'},
        {'value': 0, 'name': 'B'},
        {'value': 0, 'name': 'B-'},
        {'value': 0, 'name': 'C+'},
        {'value': 0, 'name': 'C'},
        {'value': 0, 'name': 'C-'},
        {'value': 0, 'name': 'D+'},
        {'value': 0, 'name': 'D'},
        {'value': 0, 'name': 'D-'},
        {'value': 0, 'name': 'F'},
    ]

    def listToObj(values):
        return {'name': values[0], 'value': values[1]}

    try:
        return list(map(lambda x: listToObj(x.split(':')), value.split('|')))
    except Exception:
        return default_value


class Command(BaseCommand):
    help = "Set config.models.Entry.find(name='grade_options') to requests those don't have gradeoptions in review"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Start setting default grade options'))

        try:
            gradeOptions = get_grade_options(Entry.objects.get(name='grade_options'))
        except Entry.DoesNotExist:
            self.stdout.write(self.style.ERROR('grade_options does not exist'))
            return

        for request in Request.objects.all():
            try:
                reviews = json.loads(request.review)
                if reviews.get('gradeoptions') is None or len(reviews.keys()) == 1:
                    reviews['gradeoptions'] = gradeOptions
                    Request.objects.filter(pk=request.pk).update(review=json.dumps(reviews))
                    self.stdout.write(
                        self.style.SUCCESS(
                            'Adding gradeoptions successfully to request {}'.format(str(request))))
            except Exception as err:
                self.stdout.write(self.style.ERROR(str(err)))

        self.stdout.write(self.style.WARNING('Start setting default grade options'))
