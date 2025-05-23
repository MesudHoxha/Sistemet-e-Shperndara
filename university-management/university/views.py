from django.contrib.auth.models import User
from rest_framework import viewsets, generics, serializers, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.decorators import action
from .permissions import RolePermission
from rest_framework import status
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Avg
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.contrib.auth import update_session_auth_hash
from .mixins import TenantFilterMixin

import re
from .models import *
from .serializers import *


# ===================================
# 🔐 AUTENTIKIM & REGJISTRIM
# ===================================

# 🔸 JWT Login me Email (pa përdorur username)
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('username', None)  # largojmë fushën e username

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Email ose fjalëkalim i pasaktë!")
        attrs['username'] = user.username  # vendosim username për validim të mëtejshëm
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # shtojmë të dhëna shtesë në token
        token['role'] = user.userprofile.role
        token['email'] = user.email
        return token

    class Meta:
        model = User
        fields = ['email', 'password']


# View që përdor serializer-in më sipër për login me email
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


# 🔸 Serializer për regjistrimin e përdoruesve të rinj
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


# View për regjistrimin e përdoruesve të rinj (qasje publike)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


# 🔸 Kthen profilin e përdoruesit të autentikuar
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    return Response({
        'username': request.user.username,
        'email': request.user.email,
        'role': request.user.userprofile.role,
        'first_name': user.first_name,
        'last_name': user.last_name
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not user.check_password(old_password):
        return Response({'detail': 'Fjalëkalimi i vjetër nuk është i saktë.'}, status=400)

    if new_password != confirm_password:
        return Response({'detail': 'Fjalëkalimi i ri nuk përputhet me konfirmimin.'}, status=400)

    # Regex për kontrollin e fjalëkalimit
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    if not re.match(pattern, new_password):
        return Response({
            'detail': 'Fjalëkalimi i ri duhet të ketë së paku 8 karaktere, një shkronjë të madhe, një të vogël, një numër dhe një simbol special.'
        }, status=400)

    user.set_password(new_password)
    user.save()
    update_session_auth_hash(request, user)
    return Response({'detail': 'Fjalëkalimi u ndryshua me sukses.'})



# ===================================
# 🧑‍🎓 ROLET KRYESORE NË SISTEM
# ===================================
# 🔸 Menaxhimi i studentëve
class StudentViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        return self.get_tenant_queryset(Student.objects.all())

    def get_permissions(self):
        if self.request.method in ['DELETE']:
            return [RolePermission(['admin'])]
        if self.request.method == 'GET':
            return [RolePermission(['admin', 'professor', 'secretary', 'student', 'finance', 'exam', 'librarian'])]
        return [RolePermission(['admin', 'professor', 'secretary', 'finance', 'exam', 'librarian'])]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'userprofile') and user.userprofile.role == 'student':
            return Student.objects.filter(user=user)
        return Student.objects.all()

    @action(detail=True, methods=['get'], url_path='average-grade')
    def average_grade(self, request, pk=None):
        try:
            role = request.user.userprofile.role
        except UserProfile.DoesNotExist:
            return Response({"detail": "Profili i përdoruesit nuk ekziston."}, status=403)

        if role not in ['admin', 'finance', 'secretary', 'professor']:
            return Response({"detail": "Nuk keni leje për këtë veprim."}, status=403)

        student = self.get_object()
        avg = Grade.objects.filter(student=student).aggregate(average=Avg('score'))['average']
        return Response({"average_grade": round(avg, 2) if avg else 0.0})





# 🔸 Menaxhimi i profesorëve
class ProfessorViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = Professor.objects.all()
    serializer_class = ProfessorSerializer

    def get_queryset(self):
        return self.get_tenant_queryset(Professor.objects.all())

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [RolePermission(['admin', 'secretary', 'finance', 'exam', 'professor'])]
        return [RolePermission(['admin', 'secretary', 'finance', 'exam'])]
 
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'userprofile') and user.userprofile.role == 'professor':
            return Professor.objects.filter(user=user)
        return Professor.objects.all()



# 🔸 Menaxhimi i sekretarëve (kufizohet në vetë-sekretarin nëse nuk është admin)
class SecretaryViewSet(viewsets.ModelViewSet):
    queryset = Secretary.objects.all()
    serializer_class = SecretarySerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'userprofile') and user.userprofile.role == 'secretary':
            return Secretary.objects.filter(user=user)
        return Secretary.objects.all()

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['admin'])]
        return [RolePermission(['admin', 'secretary', 'finance'])]

    @action(detail=False, methods=['get'])
    def me(self, request):
        user = request.user
        try:
            secretary = Secretary.objects.get(user=user)
            serializer = self.get_serializer(secretary)
            return Response(serializer.data)
        except Secretary.DoesNotExist:
            return Response({'detail': 'Sekretari nuk u gjet.'}, status=404)



# 🔸 Menaxhimi i stafit të financës
class FinanceViewSet(viewsets.ModelViewSet):
    queryset = Finance.objects.all()
    serializer_class = FinanceSerializer

    def get_permissions(self):
        return [RolePermission(['finance', 'admin'])]


# 🔸 Menaxhimi i bibliotekarëve
class LibrarianViewSet(viewsets.ModelViewSet):
    queryset = Librarian.objects.all()
    serializer_class = LibrarianSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'userprofile'):
            if user.userprofile.role == 'librarian':
                return Librarian.objects.filter(user=user)
        return Librarian.objects.all()

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['admin'])]
        return [RolePermission(['admin', 'librarian', 'finance'])]



# 🔸 Menaxhimi i oficerëve të provimeve
class ExamOfficerViewSet(viewsets.ModelViewSet):
    queryset = ExamOfficer.objects.all()
    serializer_class = ExamOfficerSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['admin'])]
        return [RolePermission(['admin', 'finance'])]


# ===================================
# 📘 FUNKSIONALITETE AKADEMIKE
# ===================================

# 🔸 Menaxhimi i lëndëve

class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    filterset_fields = ['department']

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role == 'secretary':
            try:
                secretary = Secretary.objects.get(user=user)
                return Subject.objects.filter(department__faculty=secretary.faculty)
            except Secretary.DoesNotExist:
                return Subject.objects.none()
        elif user.userprofile.role == 'professor':
            professor = Professor.objects.get(user=user)
            return Subject.objects.filter(professor=professor)
        elif user.userprofile.role == 'student':
            student = Student.objects.get(user=user)
            return Subject.objects.filter(department=student.department)
        return Subject.objects.all()

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['secretary'])]
        return [RolePermission(['student', 'secretary', 'professor', 'exam'])]


# 🔸 Menaxhimi i notave
@method_decorator(cache_page(60 * 15), name='list')
class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT']:
            return [RolePermission(['professor'])]
        return [RolePermission(['professor', 'student'])]

    def perform_create(self, serializer):
        exam = serializer.validated_data['exam']
        subject = serializer.validated_data['subject']
        if subject != exam.subject:
            raise serializers.ValidationError("Subject duhet të përputhet me atë të exam-it.")
        serializer.save()


# 🔸 Vetëm notat e studentit të kyçur
@method_decorator(cache_page(60 * 15), name='list')
class MyGradesViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GradeSerializer

    def get_permissions(self):
        return [RolePermission(['student'])]

    def get_queryset(self):
        return Grade.objects.filter(student__user=self.request.user)


# 🔸 Menaxhimi i provimeve
class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'userprofile') and user.userprofile.role == 'exam_officer':
            try:
                officer = ExamOfficer.objects.get(user=user)
                return Exam.objects.filter(subject__department__faculty=officer.faculty)
            except ExamOfficer.DoesNotExist:
                return Exam.objects.none()
        return Exam.objects.all()

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['exam'])]
        return [RolePermission(['exam','student', 'professor'])]



# 🔸 Menaxhimi i orarit
class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['professor'])]
        return [RolePermission(['student', 'professor'])]




# 🔸 Menaxhimi i pjesëmarrjes në ligjërata
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    
    def get_permissions(self):
        if self.request.method in ['POST', 'PUT']:
            return [RolePermission(['professor'])]
        return [RolePermission(['professor', 'student'])]

    def get_queryset(self):
        user = self.request.user
        role = user.userprofile.role

        if role == 'professor':
            professor = Professor.objects.get(user=user)
            return Attendance.objects.filter(subject__professor=professor)
        elif role == 'student':
            student = Student.objects.get(user=user)
            return Attendance.objects.filter(student=student)
        return Attendance.objects.all()
    


# 🔸 Regjistrimet e studentëve në lëndë
class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['student'])]
        return [RolePermission(['admin', 'secretary', 'student'])]

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role == 'student':
            student = Student.objects.get(user=user)
            return Enrollment.objects.filter(student=student)
        return Enrollment.objects.all()

    def perform_create(self, serializer):
        student = Student.objects.get(user=self.request.user)
        serializer.save(student=student)


# ===================================
# 🏢 STRUKTURA ORGANIZATIVE
# ===================================

# 🔸 Fakultetet
class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['admin'])]
        return [RolePermission(['admin', 'secretary', 'exam', 'student', 'professor'])]




# 🔸 Departamentet (filtruar në bazë të fakultetit të sekretarit nëse aplikohet)
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role == 'secretary':
            try:
                secretary = Secretary.objects.get(user=user)
                return Department.objects.filter(faculty=secretary.faculty)
            except Secretary.DoesNotExist:
                return Department.objects.none()
        return Department.objects.all()

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['secretary', 'admin'])]
        return [RolePermission(['admin', 'secretary', 'finance', 'exam', 'student', 'professor'])]


# 🔸 Ndërtesat (kufizuara për sekretarin në bazë të fakultetit të tij)
class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer

    def get_permissions(self):
        return [RolePermission(['admin', 'secretary'])]

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role == 'secretary':
            return Building.objects.filter(faculty=user.secretary.faculty)
        return Building.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.userprofile.role == 'secretary':
            serializer.save(faculty=user.secretary.faculty)
        else:
            serializer.save()


# 🔸 Dhomat (filtruar në bazë të ndërtesave të sekretarit)
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['secretary'])]
        return [RolePermission(['secretary', 'exam'])]

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role == 'secretary':
            return Room.objects.filter(building__faculty=user.secretary.faculty)
        return Room.objects.all()


# ===================================
# 📚 ADMINISTRATË & MBËSHTETJE
# ===================================

# 🔸 Bibliotekat (menaxhohen nga admin ose librarian)
class LibraryViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = Library.objects.all()
    serializer_class = LibrarySerializer

    def get_queryset(self):
        return self.get_tenant_queryset(Library.objects.all())

    def get_permissions(self):
        return [RolePermission(['admin', 'librarian', 'secretary'])]


# 🔸 Librat e bibliotekës
User = get_user_model()
class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_permissions(self):
        return [RolePermission(['admin', 'librarian'])]

    @action(detail=False, methods=['post'], url_path='loan')
    def loan_book(self, request):
        book_id = request.data.get('book')
        student_id = request.data.get('student')
        try:
            book = Book.objects.get(id=book_id)
            student = User.objects.get(id=student_id)

            if book.is_borrowed:
                return Response({'error': 'Ky libër është tashmë i huazuar.'}, status=400)

            book.is_borrowed = True
            book.borrowed_by = student
            book.save()

            return Response({'message': 'Libri u huazua me sukses.'})
        except Book.DoesNotExist:
            return Response({'error': 'Libri nuk u gjet.'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'Studenti nuk u gjet.'}, status=404)

    @action(detail=False, methods=['post'], url_path='return')
    def return_book(self, request):
        book_id = request.data.get('book')
        try:
            book = Book.objects.get(id=book_id)
            book.is_borrowed = False
            book.borrowed_by = None
            book.save()
            return Response({'message': 'Libri u dorëzua me sukses.'})
        except Book.DoesNotExist:
            return Response({'error': 'Libri nuk u gjet.'}, status=404)



# 🔸 Huazimi i librave (menaxhohet nga librarian)
class BookLoanViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = BookLoan.objects.all()
    serializer_class = BookLoanSerializer

    def get_queryset(self):
        return self.get_tenant_queryset(BookLoan.objects.all())

    def get_permissions(self):
        return [RolePermission(['librarian'])]

    @action(detail=False, methods=['post'], url_path='return')
    def return_book(self, request):
        loan_id = request.data.get('loan_id')
        loan = get_object_or_404(BookLoan, id=loan_id, returned=False)
        loan.return_book()
        return Response({"message": "Libri u dorëzua me sukses."})





# 🔸 Pagesat e përgjithshme (menaxhohen vetëm nga finance/admin)
class PaymentViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return self.get_tenant_queryset(Payment.objects.all())

    def get_permissions(self):
        return [RolePermission(['finance'])]


# 🔸 Menaxhimi i bursave për studentët
class ScholarshipViewSet(viewsets.ModelViewSet):
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer
    
         
    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [RolePermission(['finance'])]
        return [RolePermission(['finance', 'student'])]


# 🔸 Aplikimi për bursë nga studenti
class ScholarshipApplicationViewSet(viewsets.ModelViewSet):
    queryset = ScholarshipApplication.objects.all()
    serializer_class = ScholarshipApplicationSerializer
    student = models.ForeignKey(User, on_delete=models.CASCADE)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['student', 'finance'])]  # Vetëm studentët mund të aplikojnë
        return [RolePermission(['finance', 'student'])]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user.userprofile, 'role', None)

        if role == 'student':
            return ScholarshipApplication.objects.filter(student=user)
        elif role in ['admin', 'finance']:
            return ScholarshipApplication.objects.all()
        return ScholarshipApplication.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        month = self.request.data.get('month')
        if ScholarshipApplication.objects.filter(student=user, month=month).exists():
            raise serializers.ValidationError("Keni aplikuar tashmë për këtë muaj.")
        serializer.save(student=user)

    def partial_update(self, request, *args, **kwargs):
        print("📩 Request PATCH për bursë:", request.data)
        return super().partial_update(request, *args, **kwargs)


# 🔸 Hapja e aplikimeve për bursë – vetëm nga finance
class ScholarshipOpeningViewSet(viewsets.ModelViewSet):
    queryset = ScholarshipOpening.objects.all()
    serializer_class = ScholarshipOpeningSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'DELETE']:
            return [RolePermission(['finance'])]
        return [RolePermission(['finance', 'student'])]


# 🔸 Pagesat e stafit – vetëm finance mund t’i regjistrojë
class PaymentStaffViewSet(viewsets.ModelViewSet):
    queryset = PaymentStaff.objects.all()
    serializer_class = PaymentStaffSerializer

    def get_permissions(self):
        return [RolePermission(['finance'])]

    def perform_create(self, serializer):
        user = serializer.validated_data.get('user', None)
        month = serializer.validated_data['month']

        if user:
            profile = getattr(user, 'userprofile', None)
            if not profile:
                raise serializers.ValidationError("Ky përdorues nuk ka profil të caktuar.")
            role = profile.role
            full_name = f"{user.first_name} {user.last_name}"

            if PaymentStaff.objects.filter(user=user, month=month).exists():
                raise serializers.ValidationError("Ky staf është paguar tashmë për këtë muaj.")

            serializer.save(full_name=full_name, role=role)

        else:
            full_name = serializer.validated_data.get('full_name')
            role = serializer.validated_data.get('role')

            if PaymentStaff.objects.filter(full_name=full_name, role=role, month=month).exists():
                raise serializers.ValidationError("Ky staf është paguar tashmë për këtë muaj.")

            serializer.save()


# ===================================
# 📝 PROVIME TË DORËZUARA NGA STUDENTËT
# ===================================

# 🔸 Menaxhimi i dorëzimeve të provimeve (submission) nga studentët
class ExamSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ExamSubmission.objects.all()
    serializer_class = ExamSubmissionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['student'])]  # Vetëm studentët mund të paraqesin
        return [RolePermission(['professor', 'admin', 'student'])]

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role == 'professor':
            professor = Professor.objects.get(user=user)
            return ExamSubmission.objects.filter(subject__professor=professor)
        elif user.userprofile.role == 'student':
            student = Student.objects.get(user=user)
            return ExamSubmission.objects.filter(student=student)
        return ExamSubmission.objects.all()


    def perform_create(self, serializer):
        student = Student.objects.get(user=self.request.user)
        subject = serializer.validated_data['subject']

        if ExamSubmission.objects.filter(student=student, subject=subject).exists():
            raise serializers.ValidationError("E ke paraqitur tashmë këtë lëndë.")
        
        serializer.save(student=student)
