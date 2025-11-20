# authentication.py
from rest_framework import authentication, exceptions
from django.contrib.auth.models import User
import firebase_admin
from firebase_admin import auth as firebase_auth

# Initializing Firebase if not already done
if not firebase_admin._apps:
    cred = firebase_admin.credentials.Certificate("./threads-dbms-project-firebase-adminsdk-fbsvc-f5e752b00a.json")
    firebase_admin.initialize_app(cred)

class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Authenticate using Firebase ID Token passed in Authorization header.
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        id_token = parts[1]

        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Invalid Firebase ID token: {str(e)}')

        uid = decoded_token.get('uid')
        email = decoded_token.get('email', '')
        display_name = decoded_token.get('name') or decoded_token.get('displayName') or email

        user, created = User.objects.get_or_create(
            username=uid,  # storing Firebase UID as internal username (unique)
            defaults={
                'email': email,
                'first_name': display_name or ''
            }
        )

        # If user already exists but display_name changed, updating it
        if not created and user.first_name != display_name:
            user.first_name = display_name
            user.save(update_fields=['first_name'])

        # Attaching Firebase info for later use
        user.firebase_user = {
            'uid': uid,
            'email': email,
            'display_name': display_name
        }
        return (user, None)
