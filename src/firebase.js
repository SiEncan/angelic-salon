// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrtwSUrO0ptYwQZl0lLW_jvNq4s_O1xVo",
  authDomain: "salon-booking-b86c9.firebaseapp.com",
  projectId: "salon-booking-b86c9",
  storageBucket: "salon-booking-b86c9.firebasestorage.app",
  messagingSenderId: "391555879304",
  appId: "1:391555879304:web:70deaf92ba57a268c66a3d",
  measurementId: "G-J91L1NNF7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

export { auth, db };