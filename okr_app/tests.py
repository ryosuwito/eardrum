from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from okr_app.models import OKR, OKRFile


class TaskDetailAPITestCase(TestCase):
    def setUp(self):
        """
        Test preparation, create users, okr and okrfiles instances
        """
        self.client = APIClient()
        fileSample = SimpleUploadedFile("file.pdf", b"file_content", content_type="application/pdf")
        self.user = User.objects.create(username='okrowner')
        self.user.set_password('12345')
        self.user.save()
        self.userGuest = User.objects.create(username='guest')
        self.userGuest.set_password('12345')
        self.userGuest.save()
        self.okr = OKR(issuer=self.user, quarter="1", year="2021", content="test content")
        self.okr.save()
        self.okr_file = OKRFile(file=fileSample, okr=self.okr)
        self.okr_file.save()

    def test_get_okr_all_file_list_with_okr_owner(self):
        """
        OKR issuer can get list of all his/her okr files
        """
        self.client.login(username='okrowner', password='12345')
        self.url = '/api/okrfiles/'
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        """
        Equal to 0 because list must provide OKR id
        """
        self.assertEqual(len(response.data), 0)

    def test_get_okr_all_file_list_with_non_okr_owner(self):
        """
        Other regular user can't get each other list of all okr files
        """
        self.client.login(username='guest', password='12345')
        self.url = '/api/okrfiles/'
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        """
        Equal to 0 because list must provide OKR id
        """
        self.assertEqual(len(response.data), 0)

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

    def test_get_okr_file_list_with_non_okr_owner(self):
        """
        Other regular user can't get each other list of files of a single OKR
        """
        self.client.login(username='guest', password='12345')
        self.url = '/api/okrfiles/?okr={okr}'.format(okr=self.okr.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        """
        Equal to 0 because user is not OKR issuer
        """
        self.assertEqual(len(response.data), 0)

    def test_get_okr_file_list_without_logged_in_user(self):
        """
        Non authenticated user can't get list of files of a single OKR
        """
        self.url = '/api/okrfiles/?okr={okr}'.format(okr=self.okr.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_okr_file_detail_with_okr_owner(self):
        """
        OKR issuer can get OKR's uploaded file
        """
        self.client.login(username='okrowner', password='12345')
        self.url = '/api/okrfiles/{id}/'.format(id=self.okr_file.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.okr_file.id)

    def test_get_okr_file_detail_with_non_okr_owner(self):
        """
        Other regular user can't get each other OKR's file
        """
        self.client.login(username='guest', password='12345')
        self.url = '/api/okrfiles/{id}/'.format(id=self.okr_file.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_okr_file_detail_without_logged_in_user(self):
        """
        Non authenticated user can't get each other OKR's file
        """
        self.url = '/api/okrfiles/{id}/'.format(id=self.okr_file.id)
        response = self.client.get(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_with_non_okr_owner(self):
        """
        Other regular user can't delete each other OKR's file
        """
        self.client.login(username='guest', password='12345')
        self.url = '/api/okrfiles/{id}/'.format(id=self.okr_file.id)
        response = self.client.delete(self.url, {}, format='json')
        """
        Not found because queryset is filtered by issuer
        """
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_with_okr_owner(self):
        """
        OKR issuer can delete OKR's uploaded file
        """
        self.client.login(username='okrowner', password='12345')
        self.url = '/api/okrfiles/{id}/'.format(id=self.okr_file.id)
        response = self.client.delete(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_upload_with_non_okr_owner(self):
        """
        OKR issuer can't Upload to other user's OKR
        """
        fileSample = SimpleUploadedFile("file.pdf", b"file_content", content_type="application/pdf")
        self.client.login(username='guest', password='12345')
        self.url = '/api/okrfiles/'
        response = self.client.post(self.url, {"file": fileSample, "okr": self.okr.id}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
