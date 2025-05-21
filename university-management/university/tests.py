from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Student, Faculty, Department


class StudentModelTest(TestCase):
    def test_create_student(self):
        user = User.objects.create_user(username='student1', password='pass123')
        faculty = Faculty.objects.create(name="Inxhinieri")
        department = Department.objects.create(name="Kompjuterike", faculty=faculty)
        student = Student.objects.create(user=user, faculty=faculty, department=department)
        self.assertEqual(str(student.user.username), 'student1')


class AuthTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='admin', email='admin@test.com', password='admin123')
        # UserProfile krijohet automatikisht nga signals – thjesht e përditësojmë
        self.user.userprofile.role = 'admin'
        self.user.userprofile.save()

    def test_login(self):
        response = self.client.post('/api/token/', {
            'email': 'admin@test.com',
            'password': 'admin123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)


class FacultyApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='admin2', email='admin2@test.com', password='admin123')
        self.user.userprofile.role = 'admin'
        self.user.userprofile.save()

        # Gjenero JWT token
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + str(refresh.access_token))

    def test_get_faculties(self):
        Faculty.objects.create(name="FIEK")
        Faculty.objects.create(name="Filologjiku")
        response = self.client.get('/api/v1/faculties/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
