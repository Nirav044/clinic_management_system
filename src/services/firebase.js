// Firebase Configuration & Initialization
// Replace these values with your actual Firebase project config
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, serverTimestamp, limit } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000:web:000"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Multi-tenant helper: all queries are scoped by clinicId
const clinicRef = (clinicId) => doc(db, 'clinics', clinicId);
const patientsCol = (clinicId) => collection(db, 'clinics', clinicId, 'patients');
const appointmentsCol = (clinicId) => collection(db, 'clinics', clinicId, 'appointments');
const invoicesCol = (clinicId) => collection(db, 'clinics', clinicId, 'invoices');
const consultationsCol = (clinicId) => collection(db, 'clinics', clinicId, 'consultations');

export {
    app, db, auth,
    clinicRef, patientsCol, appointmentsCol, invoicesCol, consultationsCol,
    collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, serverTimestamp, limit,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut
};
