import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

function Form({ route, method }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

      try {
      if (method === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        navigate("/login");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // User is now signed in with Google
      const firebaseUser = result.user;
      let username = firebaseUser.displayName;
      if (!username) {
        username = prompt("Enter a username for your account:");
        if (username) {
          await updateProfile(firebaseUser, { displayName: username });
        } else {
          alert("Username is required!");
          setLoading(false);
          return;
        }
      }
      console.log("Signed in as:", result.user.displayName);
      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

   return (
  <div className="form-page">
    <form onSubmit={handleSubmit} className="form-container">
      <h1>{name}</h1>

      {/* Username only for Register */}
      {method === "register" && (
        <input
          className="form-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Display Name"
          required
        />
      )}

      <input
        className="form-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      {loading && <LoadingIndicator />}

      <button className="form-button" type="submit">
        {name}
      </button>

      {/* Divider */}
      <div className="divider">or</div>

      {/* Google Sign-In — works for both login and register */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="google-button"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          style={{ width: "20px", marginRight: "8px" }}
        />
        Continue with Google
      </button>

      {/* Footer links */}
      {method === "login" ? (
        <p className="form-footer-text">
          Don’t have an account?{" "}
          <a
            href="#"
            className="link-anchor"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
          >
            Register here
          </a>
        </p>
      ) : (
        <p className="form-footer-text">
          Already have an account?{" "}
          <a
            href="#"
            className="link-anchor"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Back to Login
          </a>
        </p>
      )}
    </form>
  </div>
);

}

export default Form
