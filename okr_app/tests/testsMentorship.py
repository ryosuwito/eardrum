from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from okr_app.models import OKR, OKRFile


class OkrMentorshipTestCase(TestCase):
    def setUp(self):
        """
        Test preparation, create users, okr and okrfiles instances
        """
        self.client = APIClient()
        fileSample = SimpleUploadedFile("file.pdf", b"file_content", content_type="application/pdf")
        self.user = User.objects.create(username='okrowner')
        self.user.set_password('12345')
        self.user.save()
        self.userMentor = User.objects.create(username='userMentor')
        self.userMentor.set_password('12345')
        self.userMentor.save()
        self.notMentor = User.objects.create(username='notMentor')
        self.notMentor.set_password('12345')
        self.notMentor.save()
        self.okr = OKR(issuer=self.user, quarter="1", year="2021", content="test content")
        self.okr.save()
        self.okr_file = OKRFile(file=fileSample, okr=self.okr)
        self.okr_file.save()
        # Assign a mentor to user
        self.user.mentorship.mentor.add(self.userMentor)
        self.user.mentorship.save()

    def test_get_okr_file_list_with_okr_owner(self):
        """
        OKR issuer can get list of files of a single OKR
        """
        self.client.login(username='okrowner', password='12345')
        self.url = '/api/okrfiles/?okr={okr}'.format(okr=self.okr.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        """
        Equal to 1 because user already upload 1 file
        """
        self.assertEqual(len(response.data), 1)

    def test_get_okr_file_list_with_mentor(self):
        """
        MENTOR can get list of files of a single OKR
        """
        self.client.login(username='userMentor', password='12345')
        self.url = '/api/okrfiles/?okr={okr}'.format(okr=self.okr.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        """
        Equal to 1 because user is owner's mentor
        """
        self.assertEqual(len(response.data), 1)

    def test_get_okr_file_detail_with_mentor(self):
        """
        Non OKR issuer / MENTOR cant get list of files of a single OKR
        """
        self.client.login(username='userMentor', password='12345')
        self.url = '/api/okrfiles/{id}/'.format(id=self.okr_file.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_okr_file_detail_with_non_mentor(self):
        """
        Non OKR issuer / MENTOR cant get list of files of a single OKR
        """
        self.client.login(username='notMentor', password='12345')
        self.url = '/api/okrfiles/{id}/'.format(id=self.okr_file.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_okr_file_list_with_non_mentor(self):
        """
        Non OKR issuer / MENTOR can't get each other list of files of a single OKR
        """
        self.client.login(username='notMentor', password='12345')
        self.url = '/api/okrfiles/?okr={okr}'.format(okr=self.okr.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        """
        Not found because queryset is filtered by issuer / mentor
        """
        self.assertEqual(len(response.data), 0)

    def test_with_removed_mentor(self):
        self.user.mentorship.mentor.remove(self.userMentor)
        self.user.mentorship.save()
        """
        Non OKR issuer / MENTOR can't get each other list of files of a single OKR
        """
        self.client.login(username='userMentor', password='12345')
        self.url = '/api/okrfiles/?okr={okr}'.format(okr=self.okr.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        """
        Not found because queryset is filtered by issuer / mentor
        """
        self.assertEqual(len(response.data), 0)
