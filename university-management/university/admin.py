from django.contrib import admin
from .models import *

# ===========================
# Students
# ===========================
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email', 'faculty', 'department', 'registration_date')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('faculty', 'department')

# ===========================
# Professors
# ===========================
@admin.register(Professor)
class ProfessorAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email', 'faculty', 'hire_date')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('faculty',)

# ===========================
# User Profiles
# ===========================
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username',)

# ===========================
# Subjects
# ===========================
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'credits', 'professor', 'department')
    search_fields = ('name',)
    list_filter = ('department', 'professor')

# ===========================
# Exams
# ===========================
@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['id', 'subject', 'get_professor_name', 'exam_date', 'room']
    def get_professor_name(self, obj):
        return f"{obj.professor.first_name} {obj.professor.last_name}"
    get_professor_name.short_description = 'Profesori'

@admin.register(ExamSubmission)
class ExamSubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'submitted_at')
    list_filter = ('subject',)
    search_fields = ('student__first_name', 'student__last_name', 'subject__name')

# ===========================
# Grades
# ===========================
@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'exam', 'score')
    list_filter = ('exam',)
    search_fields = ('student__first_name', 'student__last_name')

# ===========================
# Schedule & Attendance
# ===========================
@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['subject', 'day_of_week', 'start_time', 'end_time', 'start_date', 'end_date']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'date', 'status')
    list_filter = ('subject', 'date', 'status')

# ===========================
# Library & Books
# ===========================
@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    list_display = ('name', 'building', 'faculty')

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'isbn', 'library', 'available_copies', 'is_borrowed', 'borrowed_by', 'total_copies') 
    search_fields = ('title', 'author')

@admin.register(BookLoan)
class BookLoanAdmin(admin.ModelAdmin):
    list_display = ('book', 'student', 'borrowed_at', 'returned')
    list_filter = ('returned', 'borrowed_at')
    search_fields = ('book__title', 'student__first_name', 'student__last_name')

# ===========================
# Room & Building
# ===========================
@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'building', 'faculty')

@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'faculty')

# ===========================
# Payments & Scholarships
# ===========================
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('student', 'amount', 'payment_date')

@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('student', 'scholarship_type', 'amount', 'awarded_date')

@admin.register(PaymentStaff)
class PaymentStaffAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'role', 'amount', 'month', 'created_at')
    
@admin.register(ScholarshipApplication)
class ScholarshipApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'month', 'applied_date', 'is_approved')
    list_filter = ('month', 'is_approved')
    search_fields = ('student__first_name', 'student__last_name', 'student__email')

@admin.register(ScholarshipOpening)
class ScholarshipOpeningAdmin(admin.ModelAdmin):
    list_display = ('month', 'amount')
    search_fields = ('month',)

# ===========================
# Departments & Faculties
# ===========================
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'faculty')

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('name',)

# ===========================
# Staff Roles
# ===========================
@admin.register(Secretary)
class SecretaryAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email', 'faculty', 'hire_date')
    search_fields = ('first_name', 'last_name', 'email',)
    list_filter = ('faculty',)

@admin.register(Finance)
class FinanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email', 'hire_date')
    search_fields = ('first_name', 'last_name', 'email',)

@admin.register(Librarian)
class LibrarianAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email', 'library', 'hire_date')
    search_fields = ('first_name', 'last_name', 'email',)
    list_filter = ('library',)

@admin.register(ExamOfficer)
class ExamOfficerAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email','hire_date')
    search_fields = ('first_name', 'last_name', 'email',)

# ===========================
# Enrollment
# ===========================
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'enrollment_date')
    search_fields = ('student__first_name', 'student__last_name', 'subject__name')
    list_filter = ('subject',)
