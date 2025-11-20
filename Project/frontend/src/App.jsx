import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import AllNotesPage from "./components/AllNotesPage";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
    const [showNewNoteModal, setShowNewNoteModal] = useState(false);
      const handleNewNoteClick = () => {
    setShowNewNoteModal(true);
  };

  const handleCloseModal = () => {
    setShowNewNoteModal(false);
  };
  return (
    <BrowserRouter>
      <Navbar onNewNoteClick={handleNewNoteClick} />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <AllNotesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App