import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Navbar from "./Navbar"; 

const AdminClientManagement = () => {
  const [email, setEmail] = useState("");
  const [client, setClient] = useState(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [coffeeShops, setCoffeeShops] = useState([]);

  const adminId = auth.currentUser ? auth.currentUser.uid : null;

  // Fetch coffee shops owned by the admin
  useEffect(() => {
    const fetchCoffeeShops = async () => {
      if (!adminId) return;
      try {
        const shopsQuery = query(collection(db, "coffeeShops"), where("userId", "==", adminId));
        const shopsSnapshot = await getDocs(shopsQuery);

        const adminShops = shopsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCoffeeShops(adminShops);
      } catch (error) {
        console.error("Error fetching coffee shops:", error);
        alert("Error fetching coffee shops.");
      }
    };

    fetchCoffeeShops();
  }, [adminId]);

  // Search for a client based on email
  const searchClient = async () => {
    setLoading(true);
    try {
      const clientsQuery = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(clientsQuery);

      if (!querySnapshot.empty) {
        const clientData = querySnapshot.docs[0].data();
        setClient({ ...clientData, id: querySnapshot.docs[0].id });
        alert(`Client found: ${clientData.email}`);
      } else {
        alert("No client found with this email.");
        setClient(null);
      }
    } catch (error) {
      console.error("Error searching for client:", error);
      alert("Error searching for client.");
    } finally {
      setLoading(false);
    }
  };

  // Award points to a client
  const awardPoints = async () => {
    if (!client || points <= 0) {
      alert("Please select a valid client and enter a positive number of points.");
      return;
    }

    try {
      const clientDocRef = doc(db, "users", client.id);
      await updateDoc(clientDocRef, {
        points: client.points + points,
      });

      setClient({ ...client, points: client.points + points });
      alert(`Successfully awarded ${points} points to ${client.email}.`);
    } catch (error) {
      console.error("Error awarding points:", error);
      alert("Error awarding points.");
    }
  };

  // Fetch reviews for admin's coffee shops
  const fetchReviews = async () => {
    setLoading(true);
    try {
      if (coffeeShops.length === 0) {
        alert("No coffee shops found for this admin.");
        setLoading(false);
        return;
      }

      const shopIds = coffeeShops.map((shop) => shop.id);
      const reviewsQuery = query(collection(db, "reviews"), where("shopId", "in", shopIds));
      const reviewsSnapshot = await getDocs(reviewsQuery);

      const allReviews = reviewsSnapshot.docs.map((doc) => {
        const reviewData = doc.data();
        const coffeeShop = coffeeShops.find((shop) => shop.id === reviewData.shopId);
        return {
          id: doc.id,
          ...reviewData,
          coffeeShopName: coffeeShop ? coffeeShop.name : "Unknown Coffee Shop",
        };
      });

      setReviews(allReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Error fetching reviews.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Navbar /> {/* Include Admin Navbar */}
      <div style={styles.content}>
        <h1 style={styles.title}>Client Management</h1>

        {/* Search Client Section */}
        <div style={styles.searchSection}>
          <h2 style={styles.sectionTitle}>Search Client</h2>
          <input
            type="email"
            placeholder="Enter client email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <button onClick={searchClient} style={styles.button} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          {client && (
            <div style={styles.clientInfo}>
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Points:</strong> {client.points}</p>
            </div>
          )}
        </div>

        {/* Award Points Section */}
        {client && (
          <div style={styles.awardSection}>
            <h2 style={styles.sectionTitle}>Award Points</h2>
            <input
              type="number"
              placeholder="Enter points to award"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              style={styles.input}
            />
            <button onClick={awardPoints} style={styles.button} disabled={loading}>
              {loading ? "Awarding..." : "Award Points"}
            </button>
          </div>
        )}

        {/* View Reviews Section */}
        <div style={styles.reviewsSection}>
          <h2 style={styles.sectionTitle}>Client Reviews</h2>
          <button onClick={fetchReviews} style={styles.button} disabled={loading}>
            {loading ? "Loading Reviews..." : "Fetch Reviews"}
          </button>
          <ul style={styles.reviewsList}>
            {reviews.map((review) => (
              <li key={review.id} style={styles.reviewItem}>
                <p><strong>Client Email:</strong> {review.userEmail}</p>
                <p><strong>Review:</strong> {review.review}</p>
                <p><strong>Rating:</strong> {review.rating}/5</p>
                <p><strong>Coffee Shop:</strong> {review.coffeeShopName}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "'Roboto', sans-serif",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  content: {
    padding: "20px",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "10px",
    color: "#333",
  },
  searchSection: {
    marginBottom: "30px",
  },
  awardSection: {
    marginBottom: "30px",
  },
  reviewsSection: {
    marginTop: "30px",
  },
  input: {
    padding: "10px",
    width: "100%",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  button: {
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  clientInfo: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  reviewsList: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
  },
  reviewItem: {
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
};

export default AdminClientManagement;
