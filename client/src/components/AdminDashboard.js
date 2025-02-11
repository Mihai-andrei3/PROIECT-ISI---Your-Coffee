import React, { useState, useEffect } from "react";
import { collection, query, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import AdminNavbar from "./Navbar"; // Import the admin navbar component

const AdminDashboard = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all offers from Firestore
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const offersQuery = query(collection(db, "offers"));
        const querySnapshot = await getDocs(offersQuery);
        const fetchedOffers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched offers:", fetchedOffers); // Log fetched offers
        setOffers(fetchedOffers);
      } catch (error) {
        console.error("Error fetching offers: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Delete an offer
  const deleteOffer = async (offerId) => {
    try {
      await deleteDoc(doc(db, "offers", offerId));
      setOffers((prevOffers) => prevOffers.filter((offer) => offer.id !== offerId));
      alert("Offer deleted successfully!");
    } catch (error) {
      console.error("Error deleting offer:", error);
      alert("Failed to delete the offer.");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <AdminNavbar />
        <div style={styles.content}>
          <h2>Loading offers...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <div style={styles.content}>
        <h1 style={styles.title}>Manage Offers</h1>
        <div style={styles.offersGrid}>
          {offers.length > 0 ? (
            offers.map((offer) => (
              <div key={offer.id} style={styles.offerCard}>
                <h3 style={styles.offerName}>{offer.name}</h3>
                <p style={styles.offerDescription}>{offer.description}</p>
                <p style={styles.offerPoints}>
                  <strong>Points Required:</strong> {offer.points}
                </p>
                <button
                  style={styles.deleteButton}
                  onClick={() => deleteOffer(offer.id)}
                >
                  Delete Offer
                </button>
              </div>
            ))
          ) : (
            <p style={styles.noOffers}>No offers available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#f4f4f9",
    fontFamily: "Arial, sans-serif",
    paddingTop: "80px", 
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "20px",
  },
  offersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  offerCard: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "left",
  },
  offerName: {
    fontSize: "1.5rem",
    color: "#333",
    marginBottom: "10px",
  },
  offerDescription: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "10px",
  },
  offerPoints: {
    fontSize: "1rem",
    color: "#777",
  },
  deleteButton: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#ff4d4d",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  noOffers: {
    fontSize: "1.2rem",
    color: "#999",
  },
};

export default AdminDashboard;
