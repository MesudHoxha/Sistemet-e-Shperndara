from django.urls import path, include
from rest_framework import routers
from .views import *
from .views import user_profile
from . import views
from .views import change_password
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Initialize the router for registering viewsets
router = routers.DefaultRouter()

# Register viewsets for user roles
router.register(r'students', StudentViewSet, basename='student')
router.register(r'professors', ProfessorViewSet)
router.register(r'secretaries', SecretaryViewSet)
router.register(r'finances', FinanceViewSet)
router.register(r'librarians', LibrarianViewSet)
router.register(r'exam-officers', ExamOfficerViewSet)

# Register viewsets for academic entities
router.register(r'departments', DepartmentViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'faculties', FacultyViewSet)
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'exams', ExamViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'mygrades', MyGradesViewSet, basename='mygrades')
router.register(r'schedules', ScheduleViewSet)
router.register(r'attendances', AttendanceViewSet)


# Register viewsets for library management
router.register(r'libraries', LibraryViewSet)
router.register(r'books', BookViewSet)
router.register('book-loans', BookLoanViewSet)

# Register viewsets for campus infrastructure
router.register(r'buildings', BuildingViewSet, basename='buildings')
router.register(r'rooms', RoomViewSet, basename='rooms')

# Register viewsets for payments
router.register(r'payments', PaymentViewSet)

# Register viewsets for scholarships
router.register(r'scholarships', ScholarshipViewSet)
router.register(r'scholarship-applications', ScholarshipApplicationViewSet)
router.register(r'scholarship-openings', ScholarshipOpeningViewSet)

# Register viewsets for staff-related payments
router.register(r'staff-payments', PaymentStaffViewSet)

# Register viewsets for exam submissions
router.register(r'exam-submissions', ExamSubmissionViewSet)

# Define URL patterns for the application
urlpatterns = [
    # Include all registered routes from the router
    path('', include(router.urls)),

    # Endpoint for user registration
    path('register/', RegisterView.as_view(), name='auth_register'),

    # Endpoint for fetching user profile
    path('user-profile/', user_profile, name='user_profile'),

    # Endpoint for user login
    path('api/v1/change-password/', views.change_password),
    path('change-password/', change_password),
]




schema_view = get_schema_view(
   openapi.Info(
      title="University Management API",
      default_version='v1',
      description="Dokumentimi i API për projektin nga Sistemet e Shpërndara",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns += [
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
