from django.test import TestCase, Client
from django.contrib.auth.models import User


class MentorshipTestCase(TestCase):
    def setUp(self):
        """
        Test preparation, create users instances
        """
        self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'Password123')
        self.mentee = User.objects.create_superuser('mentee', 'admin@example.com', 'Password123')
        self.mentor = User.objects.create_superuser('mentor', 'admin@example.com', 'Password123')
        self.notmentor = User.objects.create_superuser('notmentor', 'admin@example.com', 'Password123')

    def test_assign_mentor(self):
        self.client = Client()
        self.client.login(username='admin', password='Password123')
        response = self.client.post(
            '/admin/account/mentorship/{}/change/'.format(self.mentee.id),
            {
                'user': self.mentee.id,
                'mentor': self.mentor.id,
                'employment_status': 'INTERN',
                '_save': 'Save',
            },
            follow=True,
        )
        self.client.logout()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.mentor in self.mentee.mentorship.mentor.all(), True)

    def test_mentorship_relation(self):
        self.mentee.mentorship.mentor.add(self.mentor)
        self.mentee.save()
        self.assertEqual(self.mentor in self.mentee.mentorship.mentor.all(), True)
        self.assertEqual(self.notmentor in self.mentee.mentorship.mentor.all(), False)
        mentee_list = [x.user for x in self.mentor.mentees.all()]
        self.assertEqual(self.mentee in mentee_list, True)
