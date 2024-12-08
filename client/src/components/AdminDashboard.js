import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust the import path as necessary

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
      <ul style={styles.navList}>
          <li style={styles.navItem}>
            <Link to="/coffees" style={styles.navLink}>Coffees</Link>
          </li>
          <li style={styles.navItem}>
            <Link to="/reviews" style={styles.navLink}>Reviews</Link>
          </li>
          <li style={styles.navItem}>
            <Link to="/offers" style={styles.navLink}>Offers</Link>
          </li>
          <li style={{ ...styles.navItem, marginLeft: "auto" }}>
            <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
          </li>
        </ul>
      </nav>
      <div style={styles.pageContent}>
        <h1>Admin Dashboard</h1>
        <p>Welcome to the admin dashboard.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "10px 20px",
  },
  navList: {
    display: "flex",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    width: "100%",
  },
  navItem: {
    margin: "0 15px",
  },
  navLink: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "18px",
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
  },
  pageContent: {
    padding: "20px",
  },
};

export default AdminDashboard;