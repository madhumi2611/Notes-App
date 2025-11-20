import React, { useEffect, useState } from "react";
import api from "../api";

function AllNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState({}); // track visible comments
  const [commentInputs, setCommentInputs] = useState({}); // track input for comments per note
  const [sortOrder, setSortOrder] = useState("created_latest"); // default: latest first

  useEffect(() => {
    fetchNotes();
  }, [sortOrder]);
  

    const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/notes/published/?ordering=${sortOrder}`);
      setNotes(res.data);
    } catch (error) {
      alert("Failed to fetch notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const toggleLike = async (noteId) => {
  try {
    const res = await api.post(`/api/notes/${noteId}/like/`);
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? { ...note, liked_by_user: res.data.liked, likes_count: res.data.likes_count }
          : note
      )
    );
  } catch (error) {
    console.error(error);
    alert('Failed to toggle like');
  }
};

  const toggleComments = (noteId) => {
    setCommentsVisible((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  const handleCommentChange = (noteId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [noteId]: value,
    }));
  };

  const submitComment = async (noteId) => {
    const content = commentInputs[noteId];
    if (!content || content.trim() === "") return alert("Comment cannot be empty");

    try {
      const res = await api.post(`/api/notes/${noteId}/comments/`, { content });
      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              comments: [...note.comments, res.data],
            };
          }
          return note;
        })
      );
      setCommentInputs((prev) => ({ ...prev, [noteId]: "" }));
    } catch (error) {
      alert("Failed to add comment.");
    }
  };

  if (loading) return <div>Loading...</div>;

    return (
    <div className="container mt-4">
      <h1>All Published Notes</h1>

      <div className="mb-3">
        <label htmlFor="sortOrder" className="form-label">
          Sort by:
        </label>
        <select
          id="sortOrder"
          className="form-select w-auto"
          value={sortOrder}
          onChange={handleSortChange}
        >
          <option value="-created_at">Date Created (Latest)</option>
          <option value="created_at">Date Created (Oldest)</option>
          <option value="-likes_count">Most Liked</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : notes.length === 0 ? (
        <p>No published notes found.</p>
      ) : (
        notes.map((note) => (
        <div key={note.id} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">{note.title}</h5>
            <h6 className="card-subtitle mb-2 text-muted">
              By {note.author_username} on {new Date(note.created_at).toLocaleString()}
            </h6>
            <p className="card-text">{note.content}</p>

            <button
              className={`btn btn-sm me-2 ${note.liked_by_user ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => toggleLike(note.id)}
            >
              {note.liked_by_user ? "Liked" : "Like"} ({note.likes_count})
            </button>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => toggleComments(note.id)}
            >
              {commentsVisible[note.id] ? "Hide Comments" : `Show Comments (${note.comments.length})`}
            </button>

            {/* Comments Section */}
            {commentsVisible[note.id] && (
              <div className="mt-3">
                <ul className="list-group mb-2">
                  {note.comments.map((comment) => (
                    <li key={comment.id} className="list-group-item">
                      <strong>{comment.author_username}</strong>: {comment.content}
                      <br />
                      <small className="text-muted">{new Date(comment.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a comment..."
                    value={commentInputs[note.id] || ""}
                    onChange={(e) => handleCommentChange(note.id, e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => submitComment(note.id)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))
      )}
    </div>
  );
}

export default AllNotesPage;
