from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note
from .models import Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'note', 'author', 'author_username', 'content', 'created_at']
        extra_kwargs = {'author': {'read_only': True},'note': {'read_only': True}, }

    def get_author_username(self, obj):
        return obj.author.first_name or obj.author.username

class NoteSerializer(serializers.ModelSerializer):
    author_username = serializers.SerializerMethodField()

    likes_count = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author","author_username","published", "comments", "likes_count", "liked_by_user", "published"]
        extra_kwargs = {"author": {"read_only": True}}

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_liked_by_user(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.likes.filter(id=user.id).exists()
        return False
    
    def get_author_username(self, obj):
        return obj.author.first_name or obj.author.username

