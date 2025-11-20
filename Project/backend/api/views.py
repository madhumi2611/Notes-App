from django.contrib.auth.models import User
from rest_framework.views import APIView,Response
from rest_framework import generics, permissions, serializers
from .serializers import UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note
from .models import Comment
from .serializers import CommentSerializer
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status

from rest_framework.filters import OrderingFilter
from django.db.models import Count

from .authentication import FirebaseAuthentication


@api_view(['POST'])
@authentication_classes([FirebaseAuthentication])
@permission_classes([IsAuthenticated])
def toggle_like(request, note_id):
    try:
        note = Note.objects.get(id=note_id, published=True)
    except Note.DoesNotExist:
        return Response({"detail": "Note not found or not published."}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if note.likes.filter(id=user.id).exists():
        note.likes.remove(user)
        liked = False
    else:
        note.likes.add(user)
        liked = True

    return Response({"liked": liked, "likes_count": note.likes.count()})

class PublishedNotesList(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [AllowAny]
    queryset = Note.objects.filter(published=True).select_related('author').prefetch_related('comments', 'likes').annotate(likes_count=Count('likes'))
    filter_backends = [OrderingFilter]
    ordering_fields = ['created_at', 'likes_count']
    ordering = ['-created_at']

    authentication_classes = []

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def get_queryset(self):
        qs = super().get_queryset()
        from django.db.models import Count
        return qs.annotate(likes_count=Count('likes'))

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Note.objects.filter(author=user)
            .select_related("author")
            .prefetch_related("comments", "likes")
        )

        # For sort filters
        sort = self.request.query_params.get('sort')

        if sort == "created_latest":
            queryset = queryset.order_by('-created_at')
        elif sort == "created_oldest":
            queryset = queryset.order_by('created_at')
        elif sort == "most_liked":
            queryset = queryset.annotate(likes_count=Count('likes')).order_by('-likes_count')

        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class NoteUpdate(generics.UpdateAPIView):
    serializer_class = NoteSerializer
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    

class UserProfileView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        firebase_user = getattr(request.user, "firebase_user", None)
        username = None

        if firebase_user:
            username = firebase_user.get("display_name") or firebase_user.get("email")
        else:
            username = request.user.first_name or request.user.username

        return Response({"username": username})

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        note_id = self.kwargs['note_id']
        return Comment.objects.filter(note_id=note_id, note__published=True)

    def perform_create(self, serializer):
        note_id = self.kwargs['note_id']
        try:
            note = Note.objects.get(id=note_id, published=True)
        except Note.DoesNotExist:
            raise serializers.ValidationError("Cannot comment on unpublished note.")

        serializer.save(author=self.request.user, note=note)
