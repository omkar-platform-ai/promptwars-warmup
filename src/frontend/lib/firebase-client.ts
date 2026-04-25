import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup as firebaseSignIn, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection as firebaseCollection, query as firebaseQuery, where as firebaseWhere, getDocs as firebaseGetDocs, orderBy as firebaseOrderBy, limit as firebaseLimit, onSnapshot as firebaseOnSnapshot } from 'firebase/firestore';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const isMock = !apiKey || apiKey.includes('your-api-key-here') || apiKey === 'mock-api-key';

const firebaseConfig = {
  apiKey: apiKey || 'mock-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
};

let app: any = null;
let auth: any = { currentUser: null };
let db: any = {};
let googleProvider: any = {};
let isMockActive = isMock;

try {
  if (!isMock) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  }
} catch (error) {
  console.warn("Firebase initialization failed, falling back to mock mode:", error);
  isMockActive = true;
  app = null;
  auth = { currentUser: null };
  db = {};
  googleProvider = {};
}

// Mock auth functions for UI testing without real Firebase
const signInWithPopup = isMockActive 
  ? async () => { console.log('Mock Sign In'); return { user: { uid: 'mock-123', displayName: 'Demo User', photoURL: '' } }; }
  : firebaseSignIn;

const signOut = isMockActive 
  ? async () => { console.log('Mock Sign Out'); }
  : firebaseSignOut;

const onAuthStateChanged = isMockActive
  ? (authObj: any, callback: (user: any) => void) => {
      callback({ uid: 'mock-123', displayName: 'Demo User', photoURL: '' });
      return () => {}; // return unsubscribe function
    }
  : firebaseOnAuthStateChanged;

// Mock Firestore functions
const collection = isMockActive ? (() => ({})) as any : firebaseCollection;
const query = isMockActive ? (() => ({})) as any : firebaseQuery;
const where = isMockActive ? (() => ({})) as any : firebaseWhere;
const getDocs = isMockActive ? (async () => ({ docs: [] })) as any : firebaseGetDocs;
const orderBy = isMockActive ? (() => ({})) as any : firebaseOrderBy;
const limit = isMockActive ? (() => ({})) as any : firebaseLimit;
const onSnapshot = isMockActive ? ((q: any, cb: any) => { cb({ docs: [] }); return () => {}; }) as any : firebaseOnSnapshot;

export { app, auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, isMockActive as isMock, collection, query, where, getDocs, orderBy, limit, onSnapshot };
