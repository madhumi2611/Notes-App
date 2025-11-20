import React, { useState } from "react";
import api from "../api";
import "../styles/CreateNoteModel.css";

function CreateNoteModal({ closeModal }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const createNote = async (e) => {
    setLoading(true);
    try {
      const res = await api.post("/api/notes/", { title, content });
      if (res.status === 201) {
        closeModal();
      } else {
        alert("Failed to create note.");
      }
    } catch (error) {
      alert("Error creating note: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content p-4 rounded shadow bg-white">
        <h2>Create a Note</h2>
        <form onSubmit={createNote}>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="form-control mb-3"
          />
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            name="content"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control mb-3"
            rows={4}
          />
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateNoteModal;
