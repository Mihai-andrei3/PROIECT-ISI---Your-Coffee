import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; 
import ClientNavbar from "../components/ClientNavBar"; // Import the Navbar component

const CoffeeShopSelector = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [preferredCafeId, setPreferredCafeId] = useState(null);
  const [reviews, setReviews] = useState({}); // State for reviews and ratings
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const userEmail = auth.currentUser ? auth.currentUser.email : null;

  // Fetch coffee shops from Firestore
  useEffect(() => {
    const fetchCoffeeShops = async () => {
      try {
        const q = query(collection(db, "coffeeShops"));
        const querySnapshot = await getDocs(q);
        const shops = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCoffeeShops(shops);
      } catch (error) {
        console.error("Error getting coffee shops: ", error);
      }
    };

    fetchCoffeeShops();
  }, []);

  // Fetch the preferred cafe for the user
  useEffect(() => {
    const fetchPreferredCafe = async () => {
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setPreferredCafeId(userDoc.data().preferredCafeId);
        }
      }
    };

    fetchPreferredCafe();
  }, [userId]);

  // Handle selecting a preferred cafe
  const handleSetPreferredCafe = async (cafeId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { preferredCafeId: cafeId });
      setPreferredCafeId(cafeId);
      alert("Preferred coffee shop updated!");
    } catch (error) {
      console.error("Error updating preferred cafe: ", error);
    }
  };

  // Handle review and rating input
  const handleReviewChange = (shopId, field, value) => {
    setReviews((prev) => ({
      ...prev,
      [shopId]: {
        ...prev[shopId],
        [field]: value,
      },
    }));
  };

  // Check if a user has already reviewed the shop
  const hasReviewedShop = async (shopId) => {
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("shopId", "==", shopId),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(reviewsQuery);
    return !querySnapshot.empty;
  };

  // Handle submitting a review and rating
  const handleSubmitReview = async (shopId) => {
    const shopReview = reviews[shopId];
    if (!shopReview || !shopReview.review.trim() || shopReview.rating < 1 || shopReview.rating > 5) {
      alert("Please enter a review and provide a rating between 1 and 5.");
      return;
    }

    try {
      const alreadyReviewed = await hasReviewedShop(shopId);

      if (alreadyReviewed) {
        alert("You have already reviewed this coffee shop.");
        return;
      }

      await addDoc(collection(db, "reviews"), {
        shopId,
        userId,
        userEmail,
        review: shopReview.review,
        rating: shopReview.rating,
        timestamp: new Date().toISOString(),
      });

      // Reset review and rating for the submitted shop
      setReviews((prev) => ({
        ...prev,
        [shopId]: { review: "", rating: 0 },
      }));

      alert("Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review.");
    }
  };

  return (
    <div style={styles.container}>
      <ClientNavbar />
      <div style={styles.content}>
        <div style={styles.coffeeList}>
          <h2 style={styles.pageTitle}>Available Coffee Shops</h2>
          <div style={styles.cardContainer}>
            {coffeeShops.map((shop) => (
              <div
                key={shop.id}
                style={{
                  ...styles.card,
                  ...(preferredCafeId === shop.id ? styles.preferredCard : {}),
                }}
              >
                <img
                  src={shop.picture}
                  alt={shop.name}
                  style={styles.cardImage}
                />
                <div style={styles.cardContent}>
                  <h3 style={styles.shopName}>{shop.name}</h3>
                  <p style={styles.shopAddress}>{shop.address}</p>
                  <p style={styles.shopLocation}>
                    Location: {shop.latitude}, {shop.longitude}
                  </p>
                  <button
                    style={styles.selectButton}
                    onClick={() => handleSetPreferredCafe(shop.id)}
                  >
                    {preferredCafeId === shop.id ? "Preferred" : "Set as Preferred"}
                  </button>
                  <div style={styles.reviewSection}>
                    <textarea
                      style={styles.reviewInput}
                      placeholder="Leave a review..."
                      value={reviews[shop.id]?.review || ""}
                      onChange={(e) => handleReviewChange(shop.id, "review", e.target.value)}
                    />
                    <div style={styles.ratingSection}>
                      <label style={styles.ratingLabel}>Rating (1-5):</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={reviews[shop.id]?.rating || 0}
                        onChange={(e) => handleReviewChange(shop.id, "rating", Number(e.target.value))}
                        style={styles.ratingInput}
                      />
                    </div>
                    <button
                      style={styles.reviewButton}
                      onClick={() => handleSubmitReview(shop.id)}
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
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
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  content: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px",
    gap: "40px",
  },
  coffeeList: {
    width: "100%",
  },
  pageTitle: {
    fontSize: "2rem",
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    overflow: "hidden",
    position: "relative",
  },
  preferredCard: {
    border: "2px solid #4CAF50",
    boxShadow: "0 6px 15px rgba(0, 255, 0, 0.2)",
  },
  cardImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  shopName: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
    textAlign: "center",
  },
  shopAddress: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "10px",
    textAlign: "center",
  },
  shopLocation: {
    fontSize: "0.9rem",
    color: "#777",
    textAlign: "center",
  },
  selectButton: {
    marginTop: "10px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  reviewSection: {
    marginTop: "15px",
    width: "100%",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  reviewInput: {
    width: "90%",
    maxWidth: "300px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    marginBottom: "10px",
    fontSize: "14px",
    textAlign: "center",
  },
  ratingSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  ratingLabel: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  ratingInput: {
    width: "50px",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "14px",
    textAlign: "center",
  },
  reviewButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
};

export default CoffeeShopSelector;
