from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from university.views import EmailTokenObtainPairView  # Custom JWT authentication view using email

# 🔧 Swagger/OpenAPI Schema Configuration
schema_view = get_schema_view(
    openapi.Info(
        title="University Management API",  # API title
        default_version='v1',  # API version
        description="API për menaxhimin e universitetit",  # API description in Albanian
    ),
    public=True,  # Publicly accessible
    permission_classes=(AllowAny,),  # No authentication required for schema access
    authentication_classes=[]  # Disables Basic Auth in Swagger UI
)

# 🌐 URL Patterns
urlpatterns = [
    # 🔐 Admin Panel
    path('admin/', admin.site.urls),  # Django admin panel URL

    # 📦 API Endpoints (Versioned)
    path('api/v1/', include('university.urls')),  # Include app-specific URLs for version 1 of the API

    # 🔐 JWT Authentication Endpoints
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),  # Obtain JWT token using email
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refresh JWT token

    # 📄 API Documentation (Swagger & Redoc)
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),  # Swagger UI
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),  # Redoc UI
]
