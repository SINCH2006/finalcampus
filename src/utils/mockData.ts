export interface Vehicle {
  id: string;
  driverName: string;
  vehicleNumber: string;
  capacity: number;
  currentPassengers: number;
  status: 'active' | 'idle' | 'maintenance';
  location: { lat: number; lng: number };
  route: string;
  type: 'bus' | 'cab';
}

export interface Ride {
  id: string;
  studentName: string;
  studentId: string;
  pickup: string;
  destination: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  requestTime: string;
  estimatedTime?: string;
  vehicleId?: string;
  driverName?: string;
  type: 'bus' | 'cab';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
}

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    driverName: 'John Smith',
    vehicleNumber: 'CAM-001',
    capacity: 40,
    currentPassengers: 23,
    status: 'active',
    location: { lat: 40.7128, lng: -74.0060 },
    route: 'Main Gate → North Campus → Engineering Block',
    type: 'bus'
  },
  {
    id: 'v2',
    driverName: 'Sarah Johnson',
    vehicleNumber: 'CAM-002',
    capacity: 40,
    currentPassengers: 15,
    status: 'active',
    location: { lat: 40.7228, lng: -74.0160 },
    route: 'South Campus → Library → Hostel Area',
    type: 'bus'
  },
  {
    id: 'v3',
    driverName: 'Mike Davis',
    vehicleNumber: 'CAB-001',
    capacity: 4,
    currentPassengers: 2,
    status: 'active',
    location: { lat: 40.7328, lng: -74.0260 },
    route: 'On Demand',
    type: 'cab'
  },
  {
    id: 'v4',
    driverName: 'Emily Brown',
    vehicleNumber: 'CAM-003',
    capacity: 40,
    currentPassengers: 0,
    status: 'idle',
    location: { lat: 40.7428, lng: -74.0360 },
    route: 'Parking Lot',
    type: 'bus'
  }
];

export const mockRides: Ride[] = [
  {
    id: 'r1',
    studentName: 'Alice Cooper',
    studentId: 'S001',
    pickup: 'Main Gate',
    destination: 'Engineering Block',
    status: 'in-progress',
    requestTime: '2024-01-15T09:30:00',
    estimatedTime: '10 mins',
    vehicleId: 'v1',
    driverName: 'John Smith',
    type: 'bus'
  },
  {
    id: 'r2',
    studentName: 'Bob Wilson',
    studentId: 'S002',
    pickup: 'Hostel Area',
    destination: 'Library',
    status: 'pending',
    requestTime: '2024-01-15T09:45:00',
    type: 'cab'
  },
  {
    id: 'r3',
    studentName: 'Carol Martinez',
    studentId: 'S003',
    pickup: 'South Campus',
    destination: 'Medical Center',
    status: 'accepted',
    requestTime: '2024-01-15T09:40:00',
    estimatedTime: '5 mins',
    vehicleId: 'v3',
    driverName: 'Mike Davis',
    type: 'cab'
  },
  {
    id: 'r4',
    studentName: 'David Lee',
    studentId: 'S004',
    pickup: 'Library',
    destination: 'Sports Complex',
    status: 'completed',
    requestTime: '2024-01-15T08:30:00',
    vehicleId: 'v2',
    driverName: 'Sarah Johnson',
    type: 'bus'
  }
];

export const mockStudent: Student = {
  id: 'S001',
  name: 'Alice Cooper',
  email: 'alice.cooper@campus.edu',
  phone: '+1 234 567 8900',
  department: 'Computer Science'
};

export const mockDemandData = [
  { zone: 'Main Gate', demand: 45, lat: 40.7128, lng: -74.0060 },
  { zone: 'Engineering Block', demand: 78, lat: 40.7228, lng: -74.0160 },
  { zone: 'Hostel Area', demand: 62, lat: 40.7328, lng: -74.0260 },
  { zone: 'Library', demand: 34, lat: 40.7428, lng: -74.0360 },
  { zone: 'Sports Complex', demand: 28, lat: 40.7528, lng: -74.0460 }
];

export const mockPredictions = [
  { time: '10:00', demand: 45 },
  { time: '10:30', demand: 62 },
  { time: '11:00', demand: 78 },
  { time: '11:30', demand: 85 },
  { time: '12:00', demand: 92 },
  { time: '12:30', demand: 110 },
  { time: '13:00', demand: 95 }
];
