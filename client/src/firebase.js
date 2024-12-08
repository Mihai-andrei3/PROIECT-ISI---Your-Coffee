import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBbfX836nd9m3-PS8eeSMQ9KNok5cPPO04",
    authDomain: "yourcoffee-97df6.firebaseapp.com",
    projectId: "yourcoffee-97df6",
    storageBucket: "yourcoffee-97df6.firebasestorage.app",
    messagingSenderId: "673402794938",
    appId: "1:673402794938:web:8af19c308716646af42383",
    measurementId: "G-YXKRKXG4C5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Inițializează baza de date Firestore
export const auth = getAuth(app);
export const auth = getAuth(app);

export const addCafe = async (name, address, latitude, longitude) => {
  try {
    const userId = auth.currentUser.uid;
    const docRef = await addDoc(collection(db, "cafes"), {
      name,
      address,
      latitude,
      longitude,
      userId: userId, // Store the user's ID in the coffee shop document
    });
    console.log("Cafeneaua a fost adăugată cu ID-ul:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Eroare la adăugarea cafenelei:", error);
    throw error;
  }
};

// Get coffee shops from Firestore
export const getCoffeeShops = async () => {
  const coffeeShopsRef = collection(db, "coffeeShops");
  const snapshot = await getDocs(coffeeShopsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Add a new coffee shop to Firestore
export const addCoffeeShop = async (newShop) => {
  const coffeeShopsRef = collection(db, "coffeeShops");
  await addDoc(coffeeShopsRef, newShop);
};
