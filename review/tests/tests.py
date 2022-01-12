from django.test import TestCase, Client
from django.contrib.auth.models import User
from review.models import Question, Bucket, Request, TemplateRequest
from warnings import filterwarnings


class TemplateRequestTestCase(TestCase):
    def setUp(self):
        """
        Test preparation, create users, mentorship instances
        """
        self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'Password123')
        self.mentee = User.objects.create_superuser('mentee', 'admin@example.com', 'Password123')
        self.mentor = User.objects.create_superuser('mentor', 'admin@example.com', 'Password123')
        self.mentee.mentorship.mentor.add(self.mentor)
        self.mentee.save()
        self.question = Question.objects.create(title="title", content="description")
        self.bucket = Bucket.objects.create(title="title", description="description")
        self.bucket.questions.add(self.question)
        self.bucket.extra = "{}:100".format(self.question.id)
        self.bucket.ordering = self.question.id
        self.bucket.save()

    def request_create_template(self):
        self.client = Client()
        self.client.login(username='admin', password='Password123')
        response = self.client.post(
            '/admin/review/templaterequest/add/',
            {
                'title': 'title',
                'mentorship': self.mentee.mentorship.id,
                'bucket': self.bucket.id,
                '_save': 'Save',
            },
            follow=True,
        )
        self.client.logout()
        return response

    def test_create_template_request(self):
        response = self.request_create_template()
        self.assertEqual(response.status_code, 200)
        templates = TemplateRequest.objects.all()
        self.assertEqual(len(templates), 1)
        self.assertEqual(len(self.mentee.mentorship.template_requests.all()), 1)

    def test_create_batch_request(self):
        filterwarnings('ignore', message=r'.*received a naive datetime')
        response = self.request_create_template()
        self.assertEqual(response.status_code, 200)
        templates = self.mentee.mentorship.template_requests.all()
        template = templates[0]
        self.assertEqual(len(templates), 1)
        self.client.login(username='admin', password='Password123')
        response_batch_request = self.client.post(
            '/admin/review/templaterequest/',
            {
                'selected_templates': '{}/{}'.format(template.pk, self.mentee.mentorship.pk),
                '_selected_action': 1,
                'action': 'create_batch',
                'close_at_0': '2990-01-01',
                'close_at_1': '12:59:59',
                'quarter_and_year': '1,2990',
                'apply': 'Submit'
            },
            follow=True,
        )
        self.assertEqual(response_batch_request.status_code, 200)
        requests = Request.objects.all()
        self.assertEqual(len(requests), 1)
