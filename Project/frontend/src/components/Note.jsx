import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Note({ note, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);

  const formattedDate = new Date(note.created_at).toLocaleDateString("en-US");

  const handleSave = () => {
    const updatedNote = {
      title: editedTitle,
      content: editedContent,
    };
    onUpdate(note.id, updatedNote);
    setIsEditing(false);
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        {isEditing ? (
          <>
            <input
              type="text"
              className="form-control mb-2"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
            <textarea
              className="form-control mb-2"
              rows="3"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-success" onClick={handleSave}>
                💾 Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                ✖ Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-start">
              <h5 className="card-title mb-1">{note.title}</h5>
              <small className="text-muted">{formattedDate}</small>
            </div>
            <p className="card-text mt-2">{note.content}</p>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-warning text-white"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onDelete(note.id)}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Note;
//emojis removed: 🗑 📝 ✏️
