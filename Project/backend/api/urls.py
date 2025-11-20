from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("notes/update/<int:pk>/", views.NoteUpdate.as_view(), name="update-note"),
    path('notes/<int:note_id>/like/', views.toggle_like, name='note-like'),
    path('notes/<int:note_id>/comments/', views.CommentListCreateView.as_view(), name='note-comments'),
    path('notes/published/', views.PublishedNotesList.as_view(), name='published-notes'),   
]

