import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 

const Navbar = () => {
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
          <li style={styles.navItem}>
            <Link to="/MyMap" style={styles.navLink}>MyMap</Link>
            </li>
          <li style={{ ...styles.navItem, marginLeft: "auto" }}>
            <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",  
    margin: 0,      
    padding: 0,    
    position: "absolute", 
    left: 0,        
    top: 0,         
    zIndex: 1000,   
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "10px 20px",
    width: "100%",  
    boxSizing: "border-box", 
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
};

export default Navbar;
