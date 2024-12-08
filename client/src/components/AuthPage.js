import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Adjust the import path as necessary

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // Default role is client
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const flap = document.getElementById("flap");
    const selectedRole = role === "admin" ? "0%" : "100%";
    flap.style.transform = `translateX(${selectedRole})`;
  }, [role]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect or handle successful login based on role
      if (role === 'admin') {
        console.log('Logged in as admin');
        // Redirect to admin dashboard
        navigate('/admin-dashboard');
      } else {
        console.log('Logged in as client');
        // Redirect to client dashboard
        navigate('/client-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h1 style={styles.title}>Sign In</h1>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          style={styles.input}
        />
        <div style={styles.toggleContainer}>
          <input
            type="radio"
            id="admin"
            name="role"
            value="admin"
            checked={role === 'admin'}
            onChange={() => setRole('admin')}
            disabled={loading}
            style={styles.radio}
          />
          <label htmlFor="admin" style={styles.radioLabel}>Admin</label>

          <input
            type="radio"
            id="client"
            name="role"
            value="client"
            checked={role === 'client'}
            onChange={() => setRole('client')}
            disabled={loading}
            style={styles.radio}
          />
          <label htmlFor="client" style={styles.radioLabel}>Client</label>

          <div id="flap" style={styles.flap}>
            <span style={styles.flapContent}>{role === "admin" ? "Admin" : "Client"}</span>
          </div>
        </div>
        <button type="submit" disabled={loading} style={styles.button}>Sign In</button>
        <button onClick={handleNavigateToRegister} disabled={loading} style={styles.registerButton}>Register</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '350px',
  },
  title: {
    marginBottom: '20px',
    fontSize: '24px',
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontSize: '14px',
  },
  toggleContainer: {
    position: 'relative',
    border: '2px solid #04da97',
    borderRadius: '55px',
    display: 'flex',
    justifyContent: 'space-between',
    margin: '20px 0',
    overflow: 'hidden',
    width: '100%',
  },
  radio: {
    display: 'none',
  },
  radioLabel: {
    flex: 1,
    textAlign: 'center',
    padding: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#04da97',
  },
  flap: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '50%',
    backgroundColor: '#04da97',
    transition: 'transform 0.4s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  flapContent: {
    transform: 'translateX(0)',
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#04da97',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '20px 0',
  },
  registerButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#28a745',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
};

export default AuthPage;
