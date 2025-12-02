// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
  GeoPoint,
  limit,
} from "firebase/firestore";

import { getDatabase, ref, set as rtdbSet, get as rtdbGet } from "firebase/database";

/**
 * Firebase config
 */
const firebaseConfig = {
  apiKey: "AIzaSyC9EXClZus1Zi7221Vx7ZnxO-72Jwh31jw",
  authDomain: "winter-afa2d.firebaseapp.com",
  projectId: "winter-afa2d",
  storageBucket: "winter-afa2d.firebasestorage.app",
  messagingSenderId: "566307644850",
  appId: "1:566307644850:web:897dab1e6b3139903ab0ab",
  databaseURL: "https://winter-afa2d-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

/* ============================
   TYPES
   ============================ */

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: 'bus' | 'van';
  capacity: number;
  status: 'active' | 'idle' | 'offline';
  currentLocation?: Location;
  currentPassengers: number;
  route?: string;
}

export interface Ride {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  pickup: string;
  pickupCoords: { lat: number; lng: number };
  destination: string;
  destinationCoords: { lat: number; lng: number };
  status: 'pending' | 'accepted' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  requestTime: Date;
  assignedDriver?: {
    driverId: string;
    driverName: string;
    vehicleNumber: string;
    driverPhone?: string;
  };
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  assignedTime?: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  pickupTime?: Date;
  completedTime?: Date;
  cancelledAt?: Date;
  type: 'on-demand' | 'scheduled';
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
}

export interface DemandZone {
  zone: string;
  lat: number;
  lng: number;
  demand: number;
  timestamp: Date;
  predictedDemand?: number;
}

/* ============================
   AUTH
   ============================ */

export const loginEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signUpEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const loginGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const getProviderMethods = async (email: string) => {
  return await fetchSignInMethodsForEmail(auth, email);
};

/* ============================
   ROLES & PROFILES
   ============================ */

export const setUserRole = async (uid: string, role: string) => {
  await setDoc(doc(db, "users", uid), { role }, { merge: true });
  try {
    await rtdbSet(ref(rtdb, `users/${uid}/role`), role);
  } catch (e) {
    console.warn("RTDB role set failed:", e);
  }
};

export const getUserRole = async (uid: string) => {
  try {
    // Try Firestore first
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.role) {
        console.log("Role from Firestore:", data.role);
        return data.role;
      }
    }
    
    // Fallback to RTDB
    try {
      const snapshot = await rtdbGet(ref(rtdb, `users/${uid}/role`));
      if (snapshot && snapshot.exists()) {
        const role = snapshot.val();
        console.log("Role from RTDB:", role);
        return role;
      }
    } catch (rtdbError) {
      console.warn("RTDB read failed:", rtdbError);
    }
    
    console.log("No role found for user:", uid);
    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    throw error;
  }
};

export const createUserProfile = async (uid: string, profileData: any) => {
  await setDoc(
    doc(db, "users", uid),
    {
      ...profileData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

export const getUserProfile = async (uid: string) => {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

export const updateUserProfile = async (uid: string, updates: any) => {
  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

/* ============================
   RIDES (create / realtime / updates)
   ============================ */

export const createRideRequest = async (rideData: any) => {
  const rideRef = await addDoc(collection(db, "rides"), {
    ...rideData,
    status: "pending",
    requestTime: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return rideRef.id;
};

export const getStudentRides = async (studentId: string) => {
  const q = query(collection(db, "rides"), where("studentId", "==", studentId), orderBy("createdAt", "desc"));
  const qSnap = await getDocs(q);
  return qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getRideById = async (rideId: string) => {
  const snap = await getDoc(doc(db, "rides", rideId));
  if (!snap.exists()) throw new Error("Ride not found");
  return { id: snap.id, ...snap.data() };
};

export const subscribeToStudentRides = (studentId: string, callback: (rides: any[]) => void) => {
  const q = query(collection(db, "rides"), where("studentId", "==", studentId), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const rides = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(rides);
    },
    (error) => {
      console.error("Error listening rides:", error);
      callback([]);
    }
  );
  return unsubscribe;
};

export const subscribeToRide = (rideId: string, callback: (ride: any) => void) => {
  const docRef = doc(db, "rides", rideId);
  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    (error) => {
      console.error("Error listening to ride:", error);
      callback(null);
    }
  );
  return unsubscribe;
};

export const updateRideStatus = async (rideId: string, status: string, updates?: any) => {
  await updateDoc(doc(db, "rides", rideId), {
    status,
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const cancelRide = async (rideId: string) => {
  await updateDoc(doc(db, "rides", rideId), {
    status: "cancelled",
    cancelledAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

/* ============================
   DRIVER / ADMIN helpers
   ============================ */

export const getPendingRides = async () => {
  const q = query(collection(db, "rides"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
  const qSnap = await getDocs(q);
  return qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAvailableRides = getPendingRides;

export const getDriverRides = async (driverId: string) => {
  const q = query(collection(db, "rides"), where("driverId", "==", driverId), orderBy("createdAt", "desc"));
  const qSnap = await getDocs(q);
  return qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * assignRide
 * Admin uses this to assign a pending ride to a driver.
 * driverData should include driverId, driverName, vehicleNumber, driverPhone (optional)
 */
export const assignRide = async (rideId: string, driverData: any) => {
  // set ride driver fields + set status to 'accepted' and acceptedAt
  await updateDoc(doc(db, "rides", rideId), {
    driverId: driverData.driverId,
    driverName: driverData.driverName,
    driverPhone: driverData.driverPhone || null,
    vehicleNumber: driverData.vehicleNumber || null,
    assignedDriver: {
      driverId: driverData.driverId,
      driverName: driverData.driverName,
      vehicleNumber: driverData.vehicleNumber,
      driverPhone: driverData.driverPhone || null,
    },
    status: "accepted",
    acceptedAt: Timestamp.now(),
    assignedTime: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

/**
 * startRide
 * Called by the driver when they start the ride (from Driver Dashboard).
 * Also sets status 'in-progress'
 */
export const startRide = async (rideId: string, driverId?: string) => {
  await updateDoc(doc(db, "rides", rideId), {
    status: "in-progress",
    startedAt: Timestamp.now(),
    pickupTime: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

/**
 * acceptRide (alias/backwards-compatible)
 */
export const acceptRide = assignRide;

/**
 * updateDriverLocation
 * Writes a driverLocation object inside the ride doc so subscribers see it live.
 */
export const updateDriverLocation = async (rideId: string, lat: number, lng: number) => {
  await updateDoc(doc(db, "rides", rideId), {
    driverLocation: { lat, lng, timestamp: Timestamp.now() },
    updatedAt: Timestamp.now(),
  });
};

/* ============================
   NEW: ADMIN PORTAL FUNCTIONS
   ============================ */

// Real-time listener for pending rides
export function subscribeToPendingRides(callback: (rides: Ride[]) => void) {
  const q = query(
    collection(db, 'rides'),
    where('status', '==', 'pending'),
    orderBy('requestTime', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const rides: Ride[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      rides.push({
        id: doc.id,
        studentId: data.studentId,
        studentName: data.studentName,
        studentPhone: data.studentPhone,
        pickup: data.pickup,
        pickupCoords: data.pickupCoords?.latitude 
          ? { lat: data.pickupCoords.latitude, lng: data.pickupCoords.longitude }
          : { lat: 0, lng: 0 },
        destination: data.destination,
        destinationCoords: data.destinationCoords?.latitude
          ? { lat: data.destinationCoords.latitude, lng: data.destinationCoords.longitude }
          : { lat: 0, lng: 0 },
        status: data.status,
        requestTime: data.requestTime?.toDate() || new Date(),
        type: data.type || 'on-demand',
        assignedDriver: data.assignedDriver,
        driverId: data.driverId,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        vehicleNumber: data.vehicleNumber,
        assignedTime: data.assignedTime?.toDate(),
        acceptedAt: data.acceptedAt?.toDate(),
        startedAt: data.startedAt?.toDate(),
        pickupTime: data.pickupTime?.toDate(),
        completedTime: data.completedTime?.toDate(),
        cancelledAt: data.cancelledAt?.toDate(),
        driverLocation: data.driverLocation ? {
          lat: data.driverLocation.lat,
          lng: data.driverLocation.lng,
          timestamp: data.driverLocation.timestamp?.toDate() || new Date()
        } : undefined
      } as Ride);
    });
    callback(rides);
  }, (error) => {
    console.error('Error in subscribeToPendingRides:', error);
    callback([]);
  });
}

// Real-time listener for active drivers
export function subscribeToActiveDrivers(callback: (drivers: Driver[]) => void) {
  const q = query(
    collection(db, 'drivers'),
    where('status', 'in', ['active', 'idle'])
  );

  return onSnapshot(q, (snapshot) => {
    const drivers: Driver[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      drivers.push({
        id: doc.id,
        name: data.name,
        phone: data.phone,
        vehicleNumber: data.vehicleNumber,
        vehicleType: data.vehicleType,
        capacity: data.capacity,
        status: data.status,
        currentPassengers: data.currentPassengers || 0,
        route: data.route,
        currentLocation: data.currentLocation ? {
          latitude: data.currentLocation.coordinates?.latitude || 0,
          longitude: data.currentLocation.coordinates?.longitude || 0,
          timestamp: data.currentLocation.timestamp?.toDate() || new Date(),
          speed: data.currentLocation.speed,
          heading: data.currentLocation.heading
        } : undefined
      } as Driver);
    });
    callback(drivers);
  }, (error) => {
    console.error('Error in subscribeToActiveDrivers:', error);
    callback([]);
  });
}

// Get historical ride data for ML training
export async function getHistoricalRideData(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const q = query(
    collection(db, 'rides'),
    where('requestTime', '>=', Timestamp.fromDate(startDate)),
    orderBy('requestTime', 'asc')
  );

  const snapshot = await getDocs(q);
  const rides: any[] = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    rides.push({
      id: doc.id,
      ...data,
      requestTime: data.requestTime?.toDate(),
      pickupCoords: data.pickupCoords?.latitude
        ? { lat: data.pickupCoords.latitude, lng: data.pickupCoords.longitude }
        : { lat: 0, lng: 0 }
    });
  });

  return rides;
}

// Update demand zone data
export async function updateDemandZone(zoneData: Omit<DemandZone, 'timestamp'>) {
  try {
    await addDoc(collection(db, 'demandZones'), {
      ...zoneData,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating demand zone:', error);
    throw error;
  }
}

// Get recent demand data for a zone
export async function getZoneDemandHistory(zone: string, hours: number = 24) {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - hours);

  const q = query(
    collection(db, 'demandZones'),
    where('zone', '==', zone),
    where('timestamp', '>=', Timestamp.fromDate(startTime)),
    orderBy('timestamp', 'desc'),
    limit(100)
  );

  const snapshot = await getDocs(q);
  const data: any[] = [];
  
  snapshot.forEach((doc) => {
    const docData = doc.data();
    data.push({
      ...docData,
      timestamp: docData.timestamp?.toDate()
    });
  });

  return data;
}

// Update driver location in drivers collection
export async function updateDriverLocationInDriversCollection(driverId: string, location: Location) {
  try {
    const driverRef = doc(db, 'drivers', driverId);
    await updateDoc(driverRef, {
      currentLocation: {
        coordinates: new GeoPoint(location.latitude, location.longitude),
        timestamp: Timestamp.now(),
        speed: location.speed || 0,
        heading: location.heading || 0
      },
      lastSeen: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating driver location:', error);
    throw error;
  }
}

/* ============================
   Misc
   ============================ */

export const onAuthChange = (cb: (user: any) => void) => {
  return onAuthStateChanged(auth, cb);
};

export default app;
