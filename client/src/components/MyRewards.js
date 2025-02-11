import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../firebase";
import ClientNavbar from "./ClientNavBar";
import { QRCodeCanvas } from "qrcode.react";

const MyRewards = () => {
  const [preferredCafeId, setPreferredCafeId] = useState(null);
  const [offers, setOffers] = useState([]);
  const [redeemedOffers, setRedeemedOffers] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState({}); // State for QR codes of redeemed offers
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  // Listen to points, preferred cafe, and redeemed offers in real-time
  useEffect(() => {
    if (userId) {
      const userDocRef = doc(db, "users", userId);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setPoints(userData.points || 0);
          setPreferredCafeId(userData.preferredCafeId || null);

          // Fetch redeemed offers if available
          setRedeemedOffers(userData.redeemedOffers || []);
        }
      });

      return () => unsubscribe();
    }
  }, [userId]);

  // Fetch offers for the preferred cafe
  useEffect(() => {
    const fetchOffers = async () => {
      if (preferredCafeId) {
        try {
          const offersQuery = query(
            collection(db, "offers"),
            where("cafeId", "==", preferredCafeId)
          );
          const offersSnapshot = await getDocs(offersQuery);
          const fetchedOffers = offersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOffers(fetchedOffers);
        } catch (error) {
          console.error("Error fetching offers: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [preferredCafeId]);

  // Generate QR codes for redeemed offers
  useEffect(() => {
    const generateQrCodes = () => {
      const newQrCodes = {};
      redeemedOffers.forEach((offer) => {
        newQrCodes[offer.id] = `${userId}_${offer.id}`; // Combine userId and offerId
      });
      setQrCodes(newQrCodes);
    };

    generateQrCodes();
  }, [redeemedOffers, userId]);

  // Function to redeem an offer
  const redeemOffer = async (offer) => {
    // Check if the offer has already been redeemed
    if (redeemedOffers.some((redeemed) => redeemed.id === offer.id)) {
      alert(`You have already redeemed this offer: ${offer.name}`);
      return;
    }

    if (points >= offer.points) {
      try {
        const userDocRef = doc(db, "users", userId);

        // Update points and add redeemed offer
        await updateDoc(userDocRef, {
          points: increment(-offer.points),
          redeemedOffers: [
            ...redeemedOffers,
            {
              id: offer.id,
              name: offer.name,
              description: offer.description,
              cafeId: offer.cafeId,
              redeemedAt: new Date().toISOString(),
            },
          ],
        });

        alert(`You have successfully redeemed the offer: ${offer.name}`);
      } catch (error) {
        console.error("Error redeeming offer:", error);
      }
    } else {
      alert("Not enough points to redeem this offer!");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <ClientNavbar />
        <div style={styles.content}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ClientNavbar />
      <div style={styles.pointsContainer}>
        <p style={styles.pointsText}>Available Points: <strong>{points}</strong></p>
      </div>
      <div style={styles.content}>
        <h1 style={styles.title}>My Rewards</h1>
        {preferredCafeId ? (
          <>
            <div>
              <h2 style={styles.subTitle}>Available Offers</h2>
              {offers.length > 0 ? (
                <div style={styles.offersGrid}>
                  {offers.map((offer) => {
                    const isRedeemed = redeemedOffers.some((redeemed) => redeemed.id === offer.id);
                    const progress = Math.min((points / offer.points) * 100, 100);
                    return (
                      <div key={offer.id} style={styles.offerCard}>
                        <h3 style={styles.offerName}>{offer.name}</h3>
                        <p style={styles.offerDescription}>{offer.description}</p>
                        <p style={styles.offerPoints}>
                          <strong>Points Required:</strong> {offer.points}
                        </p>
                        <div style={styles.progressBarContainer}>
                          <div
                            style={{
                              ...styles.progressBar,
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                        <p style={styles.progressText}>
                          {isRedeemed
                            ? "Offer already redeemed"
                            : progress < 100
                            ? `${offer.points - points} points needed to unlock`
                            : "Offer unlocked!"}
                        </p>
                        <button
                          style={{
                            ...styles.redeemButton,
                            backgroundColor: isRedeemed
                              ? "#ddd"
                              : points >= offer.points
                              ? "#4CAF50"
                              : "#ddd",
                            cursor: isRedeemed || points < offer.points ? "not-allowed" : "pointer",
                          }}
                          disabled={isRedeemed || points < offer.points}
                          onClick={() => redeemOffer(offer)}
                        >
                          {isRedeemed ? "Redeemed" : "Redeem Offer"}
                        </button>
                        {isRedeemed && qrCodes[offer.id] && (
                          <div style={styles.qrCodeContainer}>
                            <QRCodeCanvas value={qrCodes[offer.id]} size={100} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={styles.noOffers}>No offers available for your preferred cafe.</p>
              )}
            </div>

            <div>
              <h2 style={styles.subTitle}>Redeemed Offers</h2>
              {redeemedOffers.length > 0 ? (
                <ul style={styles.redeemedList}>
                  {redeemedOffers.map((offer, index) => (
                    <li key={index} style={styles.redeemedItem}>
                      <p style={styles.redeemedName}>{offer.name}</p>
                      <p style={styles.redeemedDate}>
                        Redeemed on: {new Date(offer.redeemedAt).toLocaleDateString()}
                      </p>
                      {qrCodes[offer.id] && (
                        <div style={styles.qrCodeContainer}>
                          <QRCodeCanvas value={qrCodes[offer.id]} size={100} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={styles.noRedeemedOffers}>No redeemed offers yet.</p>
              )}
            </div>
          </>
        ) : (
          <p style={styles.noPreferredCafe}>
            You haven't selected a preferred cafe. Please choose one in the CoffeeShopSelector.
          </p>
        )}
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
    paddingTop: "80px", // Compensates for the navbar height
  },
  pointsContainer: {
    position: "relative",
    margin: "0 auto",
    maxWidth: "800px",
    backgroundColor: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  pointsText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
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
  subTitle: {
    fontSize: "1.5rem",
    color: "#333",
    marginBottom: "10px",
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
  progressBarContainer: {
    height: "20px",
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "10px",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    transition: "width 0.3s ease-in-out",
  },
  progressText: {
    fontSize: "14px",
    color: "#666",
    marginTop: "5px",
  },
  redeemButton: {
    marginTop: "15px",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
  },
  redeemedList: {
    listStyle: "none",
    padding: 0,
  },
  redeemedItem: {
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
  redeemedName: {
    fontSize: "1rem",
    fontWeight: "bold",
  },
  redeemedDate: {
    fontSize: "0.9rem",
    color: "#666",
  },
  noOffers: {
    fontSize: "1.2rem",
    color: "#999",
  },
  noRedeemedOffers: {
    fontSize: "1.2rem",
    color: "#999",
  },
  noPreferredCafe: {
    fontSize: "1.2rem",
    color: "#999",
  },
  qrCodeContainer: {
    marginTop: "20px",
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
};


export default MyRewards;
