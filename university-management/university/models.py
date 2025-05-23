from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# ------------------------
# USER MANAGEMENT
# ------------------------

# User Profile to extend the default User model with roles
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('student', 'Student'),
        ('professor', 'Professor'),
        ('librarian', 'Librarian'),
        ('finance', 'Finance'),
        ('secretary', 'Secretary'),
        ('exam', 'Exam Officer'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# ------------------------
# ACADEMIC STRUCTURE
# ------------------------

# Faculty model to represent a faculty in the university
class Faculty(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


# Department model linked to a Faculty
class Department(models.Model):
    name = models.CharField(max_length=200)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


# Subject model linked to a Department and optionally a Professor
class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    credits = models.IntegerField(default=0)
    professor = models.ForeignKey('Professor', on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name


# ------------------------
# USER ROLES: STUDENT, PROFESSOR, STAFF
# ------------------------

# Student model linked to a User and associated with Faculty and Department
class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    registration_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def delete(self, *args, **kwargs):
        if self.user:
            self.user.delete()  # fshij edhe përdoruesin
        super().delete(*args, **kwargs)


# Professor model linked to a User and associated with Faculty and Department
class Professor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    hire_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Prof. {self.first_name} {self.last_name}"

    def delete(self, *args, **kwargs):
        if self.user:
            self.user.delete()  # fshij edhe përdoruesin
        super().delete(*args, **kwargs)


# Secretary model linked to a User and optionally associated with a Faculty
class Secretary(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    hire_date = models.DateField(auto_now_add=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def delete(self, *args, **kwargs):
        if self.user:
            self.user.delete()  # fshij edhe përdoruesin
        super().delete(*args, **kwargs)


# Finance staff model linked to a User
class Finance(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    hire_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def delete(self, *args, **kwargs):
        if self.user:
            self.user.delete()  # fshij edhe përdoruesin
        super().delete(*args, **kwargs)


# Exam Officer model linked to a User and optionally associated with a Faculty
class ExamOfficer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    hire_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def delete(self, *args, **kwargs):
        if self.user:
            self.user.delete()  # fshij edhe përdoruesin
        super().delete(*args, **kwargs)




# ------------------------
# LIBRARY MANAGEMENT
# ------------------------

# Library model to represent a library in the university
class Library(models.Model):
    name = models.CharField(max_length=100)
    building = models.ForeignKey('Building', on_delete=models.CASCADE)  # ✔ zgjidhja
    faculty = models.ForeignKey('Faculty', on_delete=models.CASCADE)

    def __str__(self):
        return self.name




# Book model linked to a Library

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13)
    library = models.ForeignKey(Library, on_delete=models.CASCADE)
    available_copies = models.IntegerField()
    is_borrowed = models.BooleanField(default=False)
    borrowed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    total_copies = models.IntegerField() 
    def __str__(self):
        return self.title

class BookLoan(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    borrowed_at = models.DateTimeField(auto_now_add=True)
    returned = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.pk:  # only on creation
            if self.book.available_copies <= 0:
                raise ValueError("Nuk ka kopje të disponueshme.")
            self.book.available_copies -= 1
            self.book.save()
        super().save(*args, **kwargs)

    def return_book(self):
        if not self.returned:
            self.book.available_copies += 1
            self.book.save()
            self.returned = True
            self.save()


# Librarian model linked to a User and associated with a Library
class Librarian(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    hire_date = models.DateField(auto_now_add=True)
    library = models.ForeignKey(Library, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
# ------------------------
# EXAMS, GRADES, ENROLLMENTS
# ------------------------

# Exam model linked to a Subject and Professor
class Exam(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    professor = models.ForeignKey(Professor, on_delete=models.CASCADE)
    exam_date = models.DateField()
    exam_time = models.TimeField()
    room = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.subject.name} - {self.exam_date}"


# Exam Submission model to track student submissions
class ExamSubmission(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'subject')

    def __str__(self):
        return f"{self.student} submitted {self.subject}"


# Grade model to store exam scores
class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.student} - {self.subject.name} - {self.score}"


# Enrollment model to track student enrollments in subjects
class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    enrollment_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} enrolled in {self.subject}"


# ------------------------
# SCHEDULE, ATTENDANCE
# ------------------------

# Schedule model to define class schedules
class Schedule(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    day_of_week = models.CharField(max_length=10)
    start_time = models.TimeField()
    end_time = models.TimeField()
    start_date = models.DateField(null=True, blank=True)  # ➕ e re
    end_date = models.DateField(null=True, blank=True) 
    def __str__(self):
        return f"{self.subject.name} on {self.day_of_week}"


# Attendance model to track student attendance
class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=[('present', 'Present'), ('absent', 'Absent')])

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.date} - {self.status}"



# ------------------------
# INFRASTRUCTURE
# ------------------------

# Building model to represent university buildings
class Building(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='buildings')

    def __str__(self):
        return self.name


# Room model linked to a Building and optionally a Faculty
class Room(models.Model):
    room_number = models.CharField(max_length=10)
    building = models.ForeignKey('Building', on_delete=models.CASCADE)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"Room {self.room_number} in {self.building.name}"



# ------------------------
# PAYMENTS & SCHOLARSHIPS
# ------------------------

# Payment model to track student payments
class Payment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()

    def __str__(self):
        return f"{self.student} paid {self.amount}"


# Scholarship model linked to a User
class Scholarship(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    scholarship_type = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    awarded_date = models.DateField()

    def __str__(self):
        return f"{self.student.email} - {self.amount} €"


# Scholarship Application model to track applications
class ScholarshipApplication(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.CharField(max_length=50)
    applied_date = models.DateField(auto_now_add=True)
    is_approved = models.BooleanField(null=True, default=None)


    class Meta:
        unique_together = ['student', 'month']

    def __str__(self):
        return f"{self.student.email} - {self.month}"



# Scholarship Opening model to define available scholarships
class ScholarshipOpening(models.Model):
    month = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.month} - {self.amount}€"


# Payment Staff model to track staff payments
class PaymentStaff(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    full_name = models.CharField(max_length=200)
    role = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.month}"


# ------------------------
# SIGNALS FOR USER PROFILE
# ------------------------



# Signal to save the UserProfile when a User is saved
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'userprofile'):
        instance.userprofile.save()
