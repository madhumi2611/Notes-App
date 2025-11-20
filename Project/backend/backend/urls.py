from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, UserProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path('api/user/profile/', UserProfileView.as_view(), name='user-profile'),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
]
