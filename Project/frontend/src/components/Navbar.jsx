import React, { useState } from "react";
import CreateNoteModal from "./CreateNoteModel";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <a
          className="navbar-brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          MyNotesApp
        </a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <button
                className="btn nav-link btn-link"
                onClick={() => navigate("/")}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn nav-link btn-link"
                onClick={() => navigate("/notes")}
              >
                All Notes
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn nav-link btn-link"
                onClick={openCreateModal}
              >
                New Note
              </button>
            </li>
          </ul>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {showCreateModal && <CreateNoteModal closeModal={closeCreateModal} />}
    </>
  );
}

export default Navbar;
