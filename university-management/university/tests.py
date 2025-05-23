from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from university.models import UserProfile, Student, Faculty, Department

class AuthTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='admin', email='admin@test.com', password='admin123')
        UserProfile.objects.create(user=self.user, role='admin')

    def test_login_token(self):
        response = self.client.post('/api/token/', {
            "email": "admin@test.com",
            "password": "admin123"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)


class FacultyApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='admin2', email='admin2@test.com', password='admin123')
        UserProfile.objects.create(user=self.user, role='admin')
        token = RefreshToken.for_user(self.user).access_token
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + str(token))

    def test_faculty_list(self):
        Faculty.objects.create(name="FIEK")
        Faculty.objects.create(name="Filologjiku")
        response = self.client.get('/api/v1/faculties/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)


class StudentCreationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='student1', password='stud123')
        UserProfile.objects.create(user=self.user, role='student')
        self.faculty = Faculty.objects.create(name='Inxhinieri')
        self.department = Department.objects.create(name='Kompjuterike', faculty=self.faculty)

    def test_create_student_model(self):
        student = Student.objects.create(
            user=self.user,
            email='student1@student.uni.com',
            first_name='Test',
            last_name='Student',
            faculty=self.faculty,
            department=self.department
        )
        self.assertEqual(str(student.first_name), 'Test')
