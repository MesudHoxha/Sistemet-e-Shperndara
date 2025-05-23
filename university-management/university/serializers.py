from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Student, UserProfile
from pprint import pprint
from django.utils.text import slugify
from .models import *

# ======================== USER SERIALIZER ========================

# Serializer për modelin bazë të përdoruesit Django
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# ======================== STUDENT ================================

# Gjeneron email unik për studentë në formatin emri.mbiemri@student.uni.com
def generate_unique_student_email(first_name, last_name):
    base_username = f"{slugify(first_name)}.{slugify(last_name)}"
    domain = "@student.uni.com"
    email = base_username + domain
    counter = 1
    while Student.objects.filter(email=email).exists() or User.objects.filter(email=email).exists():
        email = f"{base_username}{counter}{domain}"
        counter += 1
    return email.lower()

# Serializer për studentët
class StudentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name',
            'faculty', 'department', 'faculty_name', 'department_name',
            'registration_date', 'email'
        ]
        read_only_fields = ['email']
        extra_kwargs = {
            'user': {'required': False}
        }

    def get_faculty_name(self, obj):
        return obj.faculty.name if obj.faculty else None

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def create(self, validated_data):
        try:
            # Marrim të dhënat dhe gjenerojmë email unik + user
            first_name = validated_data.pop('first_name', '').capitalize()
            last_name = validated_data.pop('last_name', '').capitalize()
            email = generate_unique_student_email(first_name, last_name)
            password = "Student123"

            user = User.objects.create_user(
                username=email.split('@')[0],
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            UserProfile.objects.create(user=user, role='student') 

            faculty = validated_data.pop('faculty', None)
            department = validated_data.pop('department', None)

            if isinstance(faculty, int):
                faculty = Faculty.objects.filter(id=faculty).first()
            if not faculty:
                raise serializers.ValidationError("Fusha 'faculty' mungon ose është e pavlefshme.")

            if isinstance(department, int):
                department = Department.objects.filter(id=department).first()
            if not department:
                raise serializers.ValidationError("Fusha 'department' mungon ose është e pavlefshme.")

            student = Student.objects.create(
                user=user,
                email=email,
                first_name=first_name,
                last_name=last_name,
                faculty=faculty,
                department=department
            )

            return student

        except Exception as e:
            print("❌ GABIM gjatë krijimit të studentit:", str(e))
            raise serializers.ValidationError(str(e))


# ======================== PROFESSOR ==============================

def generate_unique_professor_email(first_name, last_name):
    base_username = f"{slugify(first_name)}.{slugify(last_name)}"
    domain = "@prof.uni.com"
    email = base_username + domain
    counter = 1
    while Professor.objects.filter(email=email).exists() or User.objects.filter(email=email).exists():
        email = f"{base_username}{counter}{domain}"
        counter += 1
    return email.lower()

class ProfessorSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = Professor
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'faculty', 'hire_date',
            'faculty_name'
        ]
        read_only_fields = ['email', 'hire_date']

    def get_faculty_name(self, obj):
        return obj.faculty.name if obj.faculty else None


    def create(self, validated_data):
        try:
            first_name = validated_data.pop('first_name', '').capitalize()
            last_name = validated_data.pop('last_name', '').capitalize()
            email = generate_unique_professor_email(first_name, last_name)
            password = "Prof123"

            user = User.objects.create_user(
                username=email.split('@')[0],
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            UserProfile.objects.create(user=user, role='professor')

            faculty = validated_data.pop('faculty')

            professor = Professor.objects.create(
                user=user,
                email=email,
                first_name=first_name,
                last_name=last_name,
                faculty=faculty,
            )

            return professor

        except Exception as e:
            print("❌ GABIM në krijimin e profesorit:", str(e))
            raise serializers.ValidationError(str(e))


# ======================== SECRETARY ==============================

def generate_unique_secretary_email(first_name, last_name):
    base_username = f"{slugify(first_name)}.{slugify(last_name)}"
    domain = "@secretary.uni.com"
    email = base_username + domain
    counter = 1
    while Secretary.objects.filter(email=email).exists() or User.objects.filter(email=email).exists():
        email = f"{base_username}{counter}{domain}"
        counter += 1
    return email.lower()

class SecretarySerializer(serializers.ModelSerializer):
    faculty = serializers.PrimaryKeyRelatedField(queryset=Faculty.objects.all())

    class Meta:
        model = Secretary
        fields = ['id', 'first_name', 'last_name', 'email', 'hire_date', 'faculty']
        read_only_fields = ['email', 'hire_date']

    def create(self, validated_data):
        try:
            first_name = validated_data.pop('first_name', '').capitalize()
            last_name = validated_data.pop('last_name', '').capitalize()
            email = generate_unique_secretary_email(first_name, last_name)
            password = "Sekret123"

            user = User.objects.create_user(
                username=email.split('@')[0],
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )

            UserProfile.objects.create(user=user, role='secretary')

            secretary = Secretary.objects.create(
                user=user,
                email=email,
                first_name=first_name,
                last_name=last_name,
                faculty=validated_data.get('faculty'),
            )

            return secretary

        except Exception as e:
            print("❌ GABIM në krijimin e sekretarit:", str(e))
            raise serializers.ValidationError(str(e))


# ======================== FINANCE ================================

def generate_unique_finance_email(first_name, last_name):
    base_username = f"{slugify(first_name)}.{slugify(last_name)}"
    domain = "@finance.uni.com"
    email = base_username + domain
    counter = 1
    while Finance.objects.filter(email=email).exists() or User.objects.filter(email=email).exists():
        email = f"{base_username}{counter}{domain}"
        counter += 1
    return email.lower()

class FinanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finance
        fields = ['id', 'first_name', 'last_name', 'email', 'hire_date']
        read_only_fields = ['email', 'hire_date']

    def create(self, validated_data):
        try:
            first_name = validated_data.pop('first_name', '').capitalize()
            last_name = validated_data.pop('last_name', '').capitalize()
            email = generate_unique_finance_email(first_name, last_name)
            password = "Finance123"

            user = User.objects.create_user(
                username=email.split('@')[0],
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )

            UserProfile.objects.create(user=user, role='finance')

            finance = Finance.objects.create(
                user=user,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )

            return finance

        except Exception as e:
            print("❌ GABIM në krijimin e financës:", str(e))
            raise serializers.ValidationError(str(e))


# ======================== LIBRARIAN ==============================

def generate_unique_librarian_email(first_name, last_name):
    base_username = f"{slugify(first_name)}.{slugify(last_name)}"
    domain = "@library.uni.com"
    email = base_username + domain
    counter = 1
    while Librarian.objects.filter(email=email).exists() or User.objects.filter(email=email).exists():
        email = f"{base_username}{counter}{domain}"
        counter += 1
    return email.lower()

class LibrarianSerializer(serializers.ModelSerializer):
    library = serializers.PrimaryKeyRelatedField(queryset=Library.objects.all())

    class Meta:
        model = Librarian
        fields = ['id', 'first_name', 'last_name', 'email', 'hire_date', 'library']
        read_only_fields = ['email', 'hire_date']

    def create(self, validated_data):
        try:
            first_name = validated_data.pop('first_name', '').capitalize()
            last_name = validated_data.pop('last_name', '').capitalize()
            email = generate_unique_librarian_email(first_name, last_name)
            password = "Library123"

            user = User.objects.create_user(
                username=email.split('@')[0],
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            UserProfile.objects.create(user=user, role='librarian')

            librarian = Librarian.objects.create(
                user=user,
                email=email,
                first_name=first_name,
                last_name=last_name,
                library=validated_data.get('library'),
            )

            return librarian

        except Exception as e:
            print("❌ GABIM në krijimin e librarian-it:", str(e))
            raise serializers.ValidationError(str(e))


# ======================== EXAM OFFICER ===========================

def generate_unique_exam_email(first_name, last_name):
    base_username = f"{slugify(first_name)}.{slugify(last_name)}"
    domain = "@exam.uni.com"
    email = base_username + domain
    counter = 1
    while ExamOfficer.objects.filter(email=email).exists() or User.objects.filter(email=email).exists():
        email = f"{base_username}{counter}{domain}"
        counter += 1
    return email.lower()

class ExamOfficerSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExamOfficer
        fields = ['id', 'first_name', 'last_name', 'email', 'hire_date']
        read_only_fields = ['email', 'hire_date']

    def create(self, validated_data):
        try:
            first_name = validated_data.pop('first_name', '').capitalize()
            last_name = validated_data.pop('last_name', '').capitalize()
            email = generate_unique_exam_email(first_name, last_name)
            password = "Exam123"

            user = User.objects.create_user(
                username=email.split('@')[0],
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            UserProfile.objects.create(user=user, role='exam')

            exam = ExamOfficer.objects.create(
                user=user,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )

            return exam

        except Exception as e:
            print("❌ GABIM në krijimin e Exam Officer-it:", str(e))
            raise serializers.ValidationError(str(e))

# ======================== SUBJECTS (LËNDËT) ========================

class SubjectSerializer(serializers.ModelSerializer):
    professor_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'description', 'credits',
            'professor', 'professor_name',
            'department', 'department_name',
        ]

    def get_professor_name(self, obj):
        return f"{obj.professor.first_name} {obj.professor.last_name}" if obj.professor else None

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None


# ======================== EXAMS (PROVIMET) =========================

class ExamSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    professor_name = serializers.SerializerMethodField()
    professor = serializers.PrimaryKeyRelatedField(queryset=Professor.objects.all())

    class Meta:
        model = Exam
        fields = ['id', 'subject', 'subject_name', 'professor', 'professor_name', 'exam_date', 'exam_time', 'room']

    def get_professor_name(self, obj):
        return f"{obj.professor.first_name} {obj.professor.last_name}" if obj.professor else None


# ======================== EXAM SUBMISSION =========================

class ExamSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = ExamSubmission
        fields = ['id', 'student', 'student_name', 'subject', 'subject_name', 'submitted_at']
        read_only_fields = ['student']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


# ======================== GRADES (NOTAT) ==========================

# serializers.py
class GradeSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    exam_subject_name = serializers.CharField(source='exam.subject.name', read_only=True)
    exam_date = serializers.DateField(source='exam.exam_date', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'student_name', 'subject', 'exam', 'score',
            'subject_name', 'exam_subject_name', 'exam_date'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"



# ======================== SCHEDULE (ORARI) ========================

class ScheduleSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Schedule
        fields = ['id', 'subject', 'subject_name', 'day_of_week', 'start_time', 'end_time', 'start_date', 'end_date']



# ======================== ATTENDANCE (PIESEMARRJA) ================

class AttendanceSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'subject', 'date', 'status', 'subject_name']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"






# ======================== LIBRARY & BOOKS =========================

class LibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    borrowed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = '__all__'

    def get_borrowed_by_name(self, obj):
        if obj.borrowed_by:
            return f"{obj.borrowed_by.first_name} {obj.borrowed_by.last_name}"
        return None

class BookLoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = BookLoan
        fields = [
            'id', 'book', 'book_title', 'book_author',
            'student', 'student_name', 'borrowed_at', 'returned'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


# ======================== BUILDINGS & ROOMS =======================

class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ['id', 'name', 'address', 'faculty']
        read_only_fields = ['faculty']

class RoomSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.name', read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    faculty = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Room
        fields = [
            'id',
            'room_number',
            'building', 'building_name',
            'faculty', 'faculty_name',
        ]




# ======================== PAYMENTS ================================

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


# ======================== SCHOLARSHIPS ============================

class ScholarshipSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Scholarship
        fields = ['id', 'student', 'student_name', 'scholarship_type', 'amount', 'awarded_date']
        read_only_fields = ['student_name']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

class ScholarshipApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    awarded = serializers.SerializerMethodField()
    amount = serializers.SerializerMethodField()
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = ScholarshipApplication
        fields = [
            'id', 'student', 'student_name', 'student_id',
            'month', 'applied_date', 'is_approved',
            'awarded', 'amount'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_student_id(self, obj):
        student_obj = Student.objects.filter(user=obj.student).first()
        return student_obj.id if student_obj else None

    def get_awarded(self, obj):
        return Scholarship.objects.filter(student=obj.student, scholarship_type=obj.month).exists()

    def get_amount(self, obj):
        scholarship = Scholarship.objects.filter(student=obj.student, scholarship_type=obj.month).first()
        return scholarship.amount if scholarship else None




class ScholarshipOpeningSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipOpening
        fields = ['id', 'month', 'amount']


# ======================== PAYMENTS FOR STAFF ======================

class PaymentStaffSerializer(serializers.ModelSerializer):
    payment_date = serializers.DateTimeField(source='created_at', format="%d/%m/%Y %H:%M", read_only=True)
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = PaymentStaff
        fields = ['id', 'user', 'full_name', 'role', 'amount', 'month', 'payment_date']
        read_only_fields = ['payment_date']

    def validate(self, attrs):
        if not attrs.get('user') and (not attrs.get('full_name') or not attrs.get('role')):
            raise serializers.ValidationError("Nëse nuk dërgon 'user', dërgo 'full_name' dhe 'role'.")
        return attrs


# ======================== FACULTY & DEPARTMENTS ===================

class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'faculty', 'faculty_name']


# ======================== ENROLLMENTS =============================

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['student']


# ======================== REGISTER USER ===========================

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, role=role)
        return user
