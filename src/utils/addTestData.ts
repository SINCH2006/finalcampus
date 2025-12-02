import { db } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function addTestDrivers() {
  const drivers = [
    {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      vehicleNumber: 'KA-01-AB-1234',
      vehicleType: 'bus',
      capacity: 40,
      status: 'active',
      currentPassengers: 0,
      route: 'Campus Loop A',
      currentLocation: {
        coordinates: {
          latitude: 13.13440,
          longitude: 77.56811
        },
        timestamp: Timestamp.now(),
        speed: 25,
        heading: 90
      }
    },
    {
      name: 'Suresh Reddy',
      phone: '+91 98765 43211',
      vehicleNumber: 'KA-01-AB-5678',
      vehicleType: 'van',
      capacity: 15,
      status: 'idle',
      currentPassengers: 0,
      route: 'Hostel Route B',
      currentLocation: {
        coordinates: {
          latitude: 13.13543,
          longitude: 77.56668
        },
        timestamp: Timestamp.now(),
        speed: 0,
        heading: 0
      }
    }
  ];

  for (const driver of drivers) {
    await addDoc(collection(db, 'drivers'), driver);
    console.log('Added driver:', driver.name);
  }
}

export async function addTestRides() {
  const rides = [
    {
      studentId: 'student1',
      studentName: 'Priya Sharma',
      studentPhone: '+91 98765 12345',
      pickup: 'B Block Boys Hostel',
      pickupCoords: {
        latitude: 13.13543,
        longitude: 77.56668
      },
      destination: 'BMSIT Main Campus',
      destinationCoords: {
        latitude: 13.13440,
        longitude: 77.56811
      },
      status: 'pending',
      requestTime: Timestamp.now(),
      type: 'on-demand',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      studentId: 'student2',
      studentName: 'Amit Patel',
      studentPhone: '+91 98765 12346',
      pickup: 'BMSIT Girls Hostel',
      pickupCoords: {
        latitude: 13.10646,
        longitude: 77.57173
      },
      destination: 'BMSIT Lab Block',
      destinationCoords: {
        latitude: 13.13401,
        longitude: 77.56855
      },
      status: 'pending',
      requestTime: Timestamp.now(),
      type: 'on-demand',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  ];

  for (const ride of rides) {
    await addDoc(collection(db, 'rides'), ride);
    console.log('Added ride for:', ride.studentName);
  }
}