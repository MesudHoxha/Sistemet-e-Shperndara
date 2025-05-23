from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from university.models import (
    UserProfile, Student, Professor, Secretary, Finance, Librarian, ExamOfficer,
    Faculty, Department, Subject, Grade, Exam, Schedule, Attendance, Library,
    Book, BookLoan, Payment, Scholarship, ScholarshipApplication, ScholarshipOpening,
    PaymentStaff, Building
)
from datetime import date, time


class BaseTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def auth_user(self, role, email, password="test123"):
        user = User.objects.create_user(username=email.split('@')[0], email=email, password=password)
        UserProfile.objects.create(user=user, role=role)
        token = RefreshToken.for_user(user).access_token
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + str(token))
        return user


# 1
class AuthLoginSuccessTest(BaseTestCase):
    def test_login_success(self):
        user = User.objects.create_user(username="admin", email="admin@uni.com", password="admin123")
        UserProfile.objects.create(user=user, role='admin')
        response = self.client.post('/api/token/', {"email": "admin@uni.com", "password": "admin123"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

# 2
class AuthLoginFailTest(BaseTestCase):
    def test_login_fail(self):
        response = self.client.post('/api/token/', {"email": "nonexistent@uni.com", "password": "wrong"})
        self.assertEqual(response.status_code, 401)

# 3
class FacultyListTest(BaseTestCase):
    def test_faculty_list(self):
        Faculty.objects.create(name="FIEK")
        Faculty.objects.create(name="Filologjiku")
        self.auth_user("admin", "admin@uni.com")
        response = self.client.get('/api/v1/faculties/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

# 4
class DepartmentListTest(BaseTestCase):
    def test_department_list(self):
        f = Faculty.objects.create(name="FIEK")
        Department.objects.create(name="Kompjuterike", faculty=f)
        Department.objects.create(name="Elektronike", faculty=f)
        self.auth_user("admin", "admin@uni.com")
        response = self.client.get('/api/v1/departments/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

# 5
class CreateStudentValidTest(BaseTestCase):
    def test_create_student_valid(self):
        f = Faculty.objects.create(name="FIEK")
        d = Department.objects.create(name="Kompjuterike", faculty=f)
        u = User.objects.create_user(username="stud1", email="s1@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="student")
        student = Student.objects.create(user=u, first_name="A", last_name="B", email="s1@uni.com", faculty=f, department=d)
        self.assertEqual(student.first_name, "A")

# 6
class CreateStudentMissingFirstNameTest(BaseTestCase):
    def test_create_student_missing_name(self):
        f = Faculty.objects.create(name="FIEK")
        d = Department.objects.create(name="Kompjuterike", faculty=f)
        u = User.objects.create_user(username="stud2", email="s2@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="student")
        with self.assertRaises(Exception):
            Student.objects.create(user=u, last_name="B", email="s2@uni.com", faculty=f, department=d)

# 7
class ProfessorValidTest(BaseTestCase):
    def test_professor_creation(self):
        f = Faculty.objects.create(name="FIEK")
        u = User.objects.create_user(username="p1", email="p1@uni.com", password="pass")
        UserProfile.objects.create(user=u, role="professor")
        p = Professor.objects.create(user=u, first_name="Prof", last_name="X", email="p1@uni.com", faculty=f)
        self.assertEqual(p.last_name, "X")

# 8
class ProfessorMissingEmailTest(BaseTestCase):
    def test_professor_missing_email(self):
        f = Faculty.objects.create(name="FIEK")
        u = User.objects.create_user(username="p2", email="p2@uni.com", password="pass")
        UserProfile.objects.create(user=u, role="professor")
        with self.assertRaises(Exception):
            Professor.objects.create(user=u, first_name="Prof", last_name="Y", faculty=f)

# 9
class SecretaryValidTest(BaseTestCase):
    def test_secretary_creation(self):
        f = Faculty.objects.create(name="FIEK")
        u = User.objects.create_user(username="sec1", email="sec@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="secretary")
        sec = Secretary.objects.create(user=u, first_name="Sec", last_name="Z", email="sec@uni.com", faculty=f)
        self.assertEqual(sec.faculty.name, "FIEK")

# 10
class FinancePaymentTest(BaseTestCase):
    def test_payment_staff(self):
        u = User.objects.create_user(username="fin1", email="fin@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="finance")
        PaymentStaff.objects.create(user=u, full_name="Fin One", role="finance", amount=2000, month="May")
        self.assertEqual(PaymentStaff.objects.count(), 1)

# 11
class LibrarianBookTest(BaseTestCase):
    def test_library_and_book(self):
        f = Faculty.objects.create(name="FIEK")
        b = Building.objects.create(name="Nd A", address="Rruga A", faculty=f)
        u = User.objects.create_user(username="lib1", email="lib@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="librarian")
        lib = Library.objects.create(name="Bib A", faculty=f, building=b)
        librarian = Librarian.objects.create(user=u, first_name="Lib", last_name="One", email="lib@uni.com", library=lib)
        book = Book.objects.create(title="Book A", author="Author A", isbn="1234567890123", library=lib, total_copies=5, available_copies=5)
        self.assertEqual(book.title, "Book A")

# 12
class ExamTest(BaseTestCase):
    def test_exam_creation(self):
        f = Faculty.objects.create(name="FIEK")
        d = Department.objects.create(name="Komp", faculty=f)
        u = self.auth_user("professor", "px@uni.com")
        p = Professor.objects.create(user=u, email="px@uni.com", first_name="P", last_name="X", faculty=f)
        subj = Subject.objects.create(name="Algoritme", credits=6, department=d, professor=p)
        exam = Exam.objects.create(subject=subj, professor=p, exam_date="2025-06-10", exam_time="12:00", room="A1")
        self.assertEqual(exam.room, "A1")

# 13
class GradeTest(BaseTestCase):
    def test_grade_value(self):
        f = Faculty.objects.create(name="FIEK")
        d = Department.objects.create(name="Komp", faculty=f)
        u = self.auth_user("professor", "px2@uni.com")
        p = Professor.objects.create(user=u, email="px2@uni.com", first_name="P", last_name="X2", faculty=f)
        subj = Subject.objects.create(name="Algoritme", credits=6, department=d, professor=p)
        exam = Exam.objects.create(subject=subj, professor=p, exam_date="2025-06-10", exam_time="12:00", room="A1")
        su = User.objects.create_user(username="stud4", email="s4@uni.com", password="1234")
        UserProfile.objects.create(user=su, role="student")
        stud = Student.objects.create(user=su, email="s4@uni.com", first_name="S", last_name="Four", faculty=f, department=d)
        grade = Grade.objects.create(student=stud, subject=subj, exam=exam, score=95)
        self.assertEqual(grade.score, 95)

# 14
class AttendanceTest(BaseTestCase):
    def test_attendance_status(self):
        f = Faculty.objects.create(name="FIEK")
        d = Department.objects.create(name="Komp", faculty=f)
        su = User.objects.create_user(username="stud5", email="s5@uni.com", password="1234")
        UserProfile.objects.create(user=su, role="student")
        stud = Student.objects.create(user=su, email="s5@uni.com", first_name="S", last_name="Five", faculty=f, department=d)
        subj = Subject.objects.create(name="DSA", credits=6, department=d)
        attendance = Attendance.objects.create(student=stud, subject=subj, date="2025-05-10", status="present")
        self.assertEqual(attendance.status, "present")

# 15–20 në pjesën tjetër nëse nevojitet për ndarje
# 15
class ScheduleCreationTest(BaseTestCase):
    def test_schedule_creation(self):
        f = Faculty.objects.create(name="FIEK")
        d = Department.objects.create(name="Komp", faculty=f)
        u = User.objects.create_user(username="p5", email="p5@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="professor")
        p = Professor.objects.create(user=u, email="p5@uni.com", first_name="Prof", last_name="Five", faculty=f)
        subj = Subject.objects.create(name="AI", credits=6, department=d, professor=p)
        schedule = Schedule.objects.create(subject=subj, day_of_week="Wednesday", start_time="10:00", end_time="12:00")
        self.assertEqual(schedule.subject.name, "AI")

# 16
class DuplicateScholarshipApplicationTest(BaseTestCase):
    def test_duplicate_scholarship_application(self):
        u = User.objects.create_user(username="s6", email="s6@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="student")
        ScholarshipOpening.objects.create(month="June", amount=400)
        ScholarshipApplication.objects.create(student=u, month="June")
        with self.assertRaises(Exception):
            ScholarshipApplication.objects.create(student=u, month="June")

# 17
class ScholarshipAwardingTest(BaseTestCase):
    def test_award_scholarship(self):
        u = User.objects.create_user(username="s7", email="s7@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="student")
        ScholarshipOpening.objects.create(month="July", amount=600)
        ScholarshipApplication.objects.create(student=u, month="July")
        s = Scholarship.objects.create(student=u, scholarship_type="July", amount=600, awarded_date=date.today())
        self.assertEqual(s.amount, 600)

# 18
class BookLoanTest(BaseTestCase):
    def test_book_loan(self):
        f = Faculty.objects.create(name="FIEK")
        b = Building.objects.create(name="Ndertesa B", address="Rruga B", faculty=f)
        lib = Library.objects.create(name="Bib B", building=b, faculty=f)
        u = User.objects.create_user(username="s8", email="s8@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="student")
        s = Student.objects.create(user=u, email="s8@uni.com", first_name="S", last_name="Eight", faculty=f, department=Department.objects.create(name="Komp", faculty=f))
        book = Book.objects.create(title="Python 101", author="Author B", isbn="9876543210123", library=lib, total_copies=3, available_copies=3)
        loan = BookLoan.objects.create(book=book, student=s)
        self.assertEqual(loan.book.title, "Python 101")

# 19
class BookReturnTest(BaseTestCase):
    def test_return_book(self):
        f = Faculty.objects.create(name="FIEK")
        b = Building.objects.create(name="Ndertesa C", address="Rruga C", faculty=f)
        lib = Library.objects.create(name="Bib C", building=b, faculty=f)
        u = User.objects.create_user(username="s9", email="s9@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="student")
        s = Student.objects.create(user=u, email="s9@uni.com", first_name="S", last_name="Nine", faculty=f, department=Department.objects.create(name="Komp", faculty=f))
        book = Book.objects.create(title="DS Book", author="Author C", isbn="1231231231231", library=lib, total_copies=5, available_copies=5)
        loan = BookLoan.objects.create(book=book, student=s)
        loan.return_book()
        self.assertTrue(loan.returned)

# 20
class DuplicatePaymentStaffTest(BaseTestCase):
    def test_duplicate_payment(self):
        u = User.objects.create_user(username="fin3", email="fin3@uni.com", password="1234")
        UserProfile.objects.create(user=u, role="finance")
        PaymentStaff.objects.create(user=u, full_name="Fin Three", role="finance", amount=1600, month="May")
        with self.assertRaises(Exception):
            PaymentStaff.objects.create(user=u, full_name="Fin Three", role="finance", amount=1600, month="May")
