import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCVazcOni69pcaGE6yoZGFrZB1zoSCiTWY",
    authDomain: "victoria-inventory.firebaseapp.com",
    projectId: "victoria-inventory",
    storageBucket: "victoria-inventory.firebasestorage.app",
    messagingSenderId: "555073981090",
    appId: "1:555073981090:web:342b551fbdc2f45f3465fb",
    measurementId: "G-XP2EERVH0Q"
  };
  

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
