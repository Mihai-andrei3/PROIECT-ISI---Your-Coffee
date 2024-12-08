import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
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

export const addCafe = async (name, address, latitude, longitude) => {
  try {
    const docRef = await addDoc(collection(db, "cafes"), {
      name,
      address,
      latitude,
      longitude,
    });
    console.log("Cafeneaua a fost adăugată cu ID-ul:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Eroare la adăugarea cafenelei:", error);
    throw error;
  }
};
