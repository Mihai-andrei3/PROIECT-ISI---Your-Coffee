import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; 
import Navbar from "../components/Navbar"; 

const Coffees = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [newShop, setNewShop] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    picture: "",
  });
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  // Fetch coffee shops only for the logged-in user
  useEffect(() => {
    if (userId) {
      const fetchCoffeeShops = async () => {
        try {
          const q = query(
            collection(db, "coffeeShops"),
            where("userId", "==", userId) // Only get coffee shops for the logged-in user
          );
          const querySnapshot = await getDocs(q);
          const shops = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCoffeeShops(shops);
        } catch (error) {
          console.error("Error getting coffee shops: ", error);
        }
      };

      fetchCoffeeShops();
    }
  }, [userId]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShop((prevShop) => ({
      ...prevShop,
      [name]: value,
    }));
  };

  // Handle form submission to add new coffee shop
  const handleAddCoffeeShop = async (e) => {
    e.preventDefault();
    if (newShop.name && newShop.address && newShop.latitude && newShop.longitude && newShop.picture) {
      try {
        await addDoc(collection(db, "coffeeShops"), {
          ...newShop,
          userId: userId, // Add the userId to the new coffee shop document
        });
        // Fetch the updated list of coffee shops
        const q = query(
          collection(db, "coffeeShops"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const shops = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCoffeeShops(shops);
        // Reset the form
        setNewShop({
          name: "",
          address: "",
          latitude: "",
          longitude: "",
          picture: "",
        });
      } catch (error) {
        console.error("Error adding coffee shop: ", error);
      }
    }
  };

  return (
    <div style={styles.container}>
      <Navbar /> {}

      <div style={styles.content}>
        <div style={styles.coffeeList}>
          <h4 style={styles.listTitle}>Existing Coffee Shops</h4>
          <div style={styles.cardContainer}>
            {coffeeShops.map((shop) => (
              <div key={shop.id} style={styles.card}>
                <img
                  src={shop.picture}
                  alt={shop.name}
                  style={styles.cardImage}
                />
                <div style={styles.cardContent}>
                  <h5 style={styles.shopName}>{shop.name}</h5>
                  <p style={styles.shopAddress}>{shop.address}</p>
                  <p style={styles.shopLocation}>
                    Location: {shop.latitude}, {shop.longitude}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form to Add a New Coffee Shop */}
        <div style={styles.addShopForm}>
          <h4 style={styles.addShopTitle}>Add New Coffee Shop</h4>
          <form onSubmit={handleAddCoffeeShop}>
            <div style={styles.formField}>
              <label htmlFor="name">Coffee Shop Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newShop.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                required
              />
            </div>

            <div style={styles.formField}>
              <label htmlFor="address">Address:</label>
              <input
                type="text"
                id="address"
                name="address"
                value={newShop.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                required
              />
            </div>

            <div style={styles.formField}>
              <label htmlFor="latitude">Latitude:</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={newShop.latitude}
                onChange={handleInputChange}
                placeholder="Enter latitude"
                required
              />
            </div>

            <div style={styles.formField}>
              <label htmlFor="longitude">Longitude:</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={newShop.longitude}
                onChange={handleInputChange}
                placeholder="Enter longitude"
                required
              />
            </div>

            <div style={styles.formField}>
              <label htmlFor="picture">Coffee Shop Picture URL:</label>
              <input
                type="url"
                id="picture"
                name="picture"
                value={newShop.picture}
                onChange={handleInputChange}
                placeholder="Enter picture URL"
                required
              />
            </div>

            <button type="submit" style={styles.submitButton}>
              Add Coffee Shop
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },
  content: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    gap: "40px",
  },
  coffeeList: {
    width: "60%",
  },
  addShopForm: {
    width: "35%",
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  formField: {
    marginBottom: "10px",
  },
  submitButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1.1rem",
    transition: "background-color 0.3s ease",
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
    transition: "transform 0.3s ease",
  },
  cardImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  },
  cardContent: {
    padding: "15px",
  },
  shopName: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  shopAddress: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "5px",
  },
  shopLocation: {
    fontSize: "0.9rem",
    color: "#777",
  },
  addShopTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
  },
  listTitle: {
    fontSize: "1.5rem",
    marginBottom: "20px",
    textAlign: "center",
  },
};

export default Coffees;