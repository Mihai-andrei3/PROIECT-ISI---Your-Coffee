import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Adjust the import path as necessary
import "./RegisterPage.css"; // Add the CSS file for your custom radio buttons

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("client"); // Default role is client
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date(),
      });

      console.log("User registered successfully");

      if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email is already registered");
          break;
        case "auth/invalid-email":
          setError("Invalid email format");
          break;
        case "auth/weak-password":
          setError("Password is too weak");
          break;
        default:
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form className="register-form" onSubmit={handleRegister}>
        <h1>Register</h1>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="input"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          className="input"
        />

        {/* Custom Radio Buttons */}
        <div className="toggle">
          <input
            type="radio"
            id="admin"
            name="role"
            value="admin"
            checked={role === "admin"}
            onChange={() => setRole("admin")}
            disabled={loading}
          />
          <label htmlFor="admin">Admin</label>

          <input
            type="radio"
            id="client"
            name="role"
            value="client"
            checked={role === "client"}
            onChange={() => setRole("client")}
            disabled={loading}
          />
          <label htmlFor="client">Client</label>

          <div id="flap">
            <span className="content">{role === "admin" ? "Admin" : "Client"}</span>
          </div>
        </div>

        <button type="submit" disabled={loading} className="button">
          {loading ? "Registering..." : "Register"}
        </button>
        <p>
          Already have an account?{" "}
          <span onClick={() => navigate("/")} className="login-link">
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
