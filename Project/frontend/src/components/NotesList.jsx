import React, { useEffect, useState } from 'react';
import api from '../api'; 
import '../styles/NotesList.css';
import Note from './Note';

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState({});
  const [comments, setComments] = useState({}); // {noteId: [comments]}
  const [showCommentsFor, setShowCommentsFor] = useState(null);

  const [sort, setSort] = useState("created_latest");

  useEffect(() => {
    getNotes();
  }, [sort]); //sort added - change latest

  const getNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/notes/?sort=${sort}`);
      setNotes(res.data);

      await Promise.all(
        res.data
          .filter(note => note.published)
          .map(note => fetchComments(note.id))
      );
    } catch (error) {
      alert('Error fetching notes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (noteId) => {
    try {
      const res = await api.get(`/api/notes/${noteId}/comments/`);
      setComments(prev => ({ ...prev, [noteId]: res.data }));
    } catch (error) {
      console.error(`Error fetching comments for note ${noteId}:`, error);
    }
  };

  const toggleLike = async (noteId) => {
  try {
    await api.post(`/api/notes/${noteId}/like/`);

    setNotes(prevNotes =>
      prevNotes.map(note => {
        if (note.id === noteId) {
          const liked = !note.liked_by_user;
          const likesCount = liked ? note.likes_count + 1 : note.likes_count - 1;

          return { ...note, liked_by_user: liked, likes_count: likesCount };
        }
        return note;
      })
    );
  } catch (error) {
    console.error('Error toggling like:', error);
    alert('Failed to toggle like');
  }
};

  const handleCommentChange = (noteId, text) => {
    setCommentInput(prev => ({ ...prev, [noteId]: text }));
  };

  const handleDelete = async (noteId) => {
    try {
      await api.delete(`/api/notes/delete/${noteId}/`);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete note');
    }
  };

  const handleUpdate = async (noteId, updatedData) => {
    try {
      await api.patch(`/api/notes/update/${noteId}/`, updatedData);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId ? { ...note, ...updatedData } : note
        )
      );
    } catch (error) {
      console.error('Update failed', error);
      alert('Failed to update note');
    }
  };

  const submitComment = async (noteId) => {
    const content = commentInput[noteId];
    if (!content || content.trim() === '') return alert('Comment cannot be empty');

    try {
      await api.post(`/api/notes/${noteId}/comments/`, { content });
      setCommentInput(prev => ({ ...prev, [noteId]: '' }));
      fetchComments(noteId);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const publishNote = async (noteId) => {
    try {
      await api.patch(`/api/notes/update/${noteId}/`, { published: true });
      getNotes();
    } catch (error) {
      console.error('Error publishing note:', error);
      alert('Failed to publish the note.');
    }
  };

  if (loading) return <div>Loading notes...</div>;

  return (
    <div className="notes-list">
      <div className="mb-3">
        <label>Sort by: </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="form-select w-auto d-inline-block ms-2"
        >
          <option value="created_latest">Created: Latest</option>
          <option value="created_oldest">Created: Oldest</option>
          <option value="most_liked">Most Liked</option>
        </select>
      </div>

      {notes.map(note => (
        <div key={note.id} className="note-card">
          
          <Note note={note} onDelete={handleDelete} onUpdate={handleUpdate} />
          <p><em>By {note.author_username}</em></p>

          {note.published ? (
            <>
              <div className="likes-section">
                <button
                  type="button"
                  className={`like-button ${note.liked_by_user ? 'liked' : ''}`}
                  onClick={() => toggleLike(note.id)}
                >
                  {note.liked_by_user ? '❤️' : '🤍'} Like
                </button>
                <span>{note.likes_count} {note.likes_count === 1 ? 'like' : 'likes'}</span>

                 {/* Toggle Comments Button */}
                <button
                  type="button"
                  className="comments-toggle-button"
                  onClick={() => setShowCommentsFor(showCommentsFor === note.id ? null : note.id)}
                  style={{ marginLeft: '10px' }}
                >
                  {showCommentsFor === note.id ? 'Hide Comments' : 'Show Comments'}
                </button>
              </div>

              
               {/* Comments Section - only shown if toggled */}
              {showCommentsFor === note.id && (
                <div className="comments-section">
                  <h4>Comments</h4>
                  {(comments[note.id] || []).map(comment => (
                    <div key={comment.id} className="comment">
                      <strong>{comment.author_username}</strong>{' '}
                      <em>({new Date(comment.created_at).toLocaleString()})</em>: {comment.content}
                    </div>
                  ))}

                <textarea
                  placeholder="Add a comment..."
                  value={commentInput[note.id] || ''}
                  onChange={(e) => handleCommentChange(note.id, e.target.value)}
                  rows={2}
                  className="comment-input"
                />
                <button onClick={() => submitComment(note.id)} className="comment-submit-button" type='button'>
                  Post Comment
                </button>
              </div>
              )}
            </>
          ) : (
            <>
              <p className="private-note">This note is private.</p>
              <button onClick={() => publishNote(note.id)} className="publish-button">
                Publish
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default NotesList;

