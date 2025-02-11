import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase"; // Replace with your Firebase configuration file
import Navbar from "./Navbar"; // Import Navbar component

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [cafes, setCafes] = useState([]); // State for fetching user-specific cafes
  const [newOffer, setNewOffer] = useState({
    name: "",
    description: "",
    points: 0,
    cafeId: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch user's cafes from Firestore
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const cafesQuery = query(collection(db, "coffeeShops"), where("userId", "==", userId));
        const querySnapshot = await getDocs(cafesQuery);
        const fetchedCafes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCafes(fetchedCafes);
      } catch (error) {
        console.error("Error fetching cafes: ", error);
      }
    };

    fetchCafes();
  }, []);

  // Fetch offers from Firestore
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const offersQuery = query(collection(db, "offers"));
        const querySnapshot = await getDocs(offersQuery);
        const fetchedOffers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOffers(fetchedOffers);
      } catch (error) {
        console.error("Error fetching offers: ", error);
      }
    };

    fetchOffers();
  }, []);

  // Get the name of the cafe for an offer
  const getCafeName = (cafeId) => {
    const cafe = cafes.find((c) => c.id === cafeId);
    return cafe ? cafe.name : "Unknown Cafe";
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOffer((prevOffer) => ({
      ...prevOffer,
      [name]: value,
    }));
  };

  // Handle form submission to add new offer
  const handleAddOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "offers"), newOffer);
      setOffers((prevOffers) => [...prevOffers, { ...newOffer, id: docRef.id }]);
      setNewOffer({
        name: "",
        description: "",
        points: 0,
        cafeId: "",
      });
    } catch (error) {
      console.error("Error adding offer: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete offer
  const handleDeleteOffer = async (offerId) => {
    try {
      await deleteDoc(doc(db, "offers", offerId));
      setOffers((prevOffers) => prevOffers.filter((offer) => offer.id !== offerId));
    } catch (error) {
      console.error("Error deleting offer: ", error);
    }
  };

  return (
    <div style={styles.container}>
      <Navbar /> {/* Include Navbar here */}
      <div style={styles.content}>
        <h2 style={styles.title}>Offers</h2>
        <form onSubmit={handleAddOffer} style={styles.form}>
          <div style={styles.formField}>
            <label htmlFor="name">Offer Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newOffer.name}
              onChange={handleInputChange}
              placeholder="Enter offer name"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={newOffer.description}
              onChange={handleInputChange}
              placeholder="Enter offer description"
              required
              style={styles.textarea}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="points">Points:</label>
            <input
              type="number"
              id="points"
              name="points"
              value={newOffer.points}
              onChange={handleInputChange}
              placeholder="Enter points required"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="cafeId">Select a Cafe:</label>
            <select
              id="cafeId"
              name="cafeId"
              value={newOffer.cafeId}
              onChange={handleInputChange}
              required
              style={styles.select}
            >
              <option value="">Select a cafe</option>
              {cafes.map((cafe) => (
                <option key={cafe.id} value={cafe.id}>
                  {cafe.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? "Adding..." : "Add Offer"}
          </button>
        </form>
        <div style={styles.offersContainer}>
          <h3 style={styles.offersTitle}>Existing Offers</h3>
          <div style={styles.offersList}>
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={styles.offerCard}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <h4 style={styles.offerTitle}>{offer.name}</h4>
                <p style={styles.offerDescription}>{offer.description}</p>
                <p style={styles.offerPoints}>Points: {offer.points}</p>
                <p style={styles.offerCafe}>Cafe: {getCafeName(offer.cafeId)}</p>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDeleteOffer(offer.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "20px auto",
    fontFamily: "'Roboto', sans-serif",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  content: {
    padding: "20px",
  },
  title: {
    fontSize: "2.2rem",
    marginBottom: "20px",
    textAlign: "center",
    color: "#4CAF50",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    outline: "none",
  },
  inputFocus: {
    borderColor: "#4CAF50",
  },
  textarea: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
    resize: "vertical",
    transition: "border-color 0.3s ease",
    outline: "none",
  },
  select: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
    backgroundColor: "#ffffff",
  },
  submitButton: {
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  submitButtonHover: {
    backgroundColor: "#45a049",
  },
  offersContainer: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  offersTitle: {
    fontSize: "1.8rem",
    marginBottom: "15px",
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
  },
  offersList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "15px",
  },
  offerCard: {
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "auto", 
    textAlign: "left",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    gap: "10px",
  },
  offerTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  offerDescription: {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3, 
  },
  offerPoints: {
    fontSize: "1rem",
    color: "#444",
    marginBottom: "10px",
  },
  offerCafe: {
    fontSize: "1rem",
    color: "#777",
    marginBottom: "10px",
  },
  deleteButton: {
    padding: "10px",
    backgroundColor: "#ff4d4d",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    alignSelf: "flex-start",
    transition: "background-color 0.3s ease",
  },
  deleteButtonHover: {
    backgroundColor: "#e60000",
  },
};


export default Offers;