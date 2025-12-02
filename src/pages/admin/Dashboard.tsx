// src/pages/admin/Dashboard.tsx
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { addTestDrivers, addTestRides } from '@/utils/addTestData';
import { Bus, Clock, AlertCircle, TrendingUp, User, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  subscribeToPendingRides, 
  subscribeToActiveDrivers, 
  assignRide,
  type Ride,
  type Driver
} from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [pendingRides, setPendingRides] = useState<Ride[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<Driver[]>([]);
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Admin Dashboard: Setting up subscriptions...');
    setLoading(true);
    
    const unsubscribeRides = subscribeToPendingRides((rides) => {
      console.log('Pending rides updated:', rides);
      setPendingRides(rides);
      setLoading(false);
    });

    const unsubscribeDrivers = subscribeToActiveDrivers((drivers) => {
      console.log('Active drivers updated:', drivers);
      setActiveDrivers(drivers);
      setLoading(false);
    });

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribeRides();
      unsubscribeDrivers();
      clearTimeout(timeout);
    };
  }, []);

  const handleAssign = async (rideId: string, driver: Driver) => {
    try {
      setAssigning(true);
      await assignRide(rideId, {
        driverId: driver.id,
        driverName: driver.name,
        vehicleNumber: driver.vehicleNumber,
        driverPhone: driver.phone,
      });

      toast({
        title: 'Ride Assigned',
        description: `Assigned to ${driver.name} (${driver.vehicleNumber})`,
      });
      setSelectedRide(null);
    } catch (error: any) {
      console.error('Assignment failed:', error);
      toast({
        title: 'Assignment Failed',
        description: error?.message || 'Failed to assign ride',
        variant: 'destructive'
      });
    } finally {
      setAssigning(false);
    }
  };

  const avgWaitTime = pendingRides.length > 0
    ? Math.round(
        pendingRides.reduce((sum, ride) => {
          try {
            let requestTime: Date;
            if (ride.requestTime?.toDate) {
              requestTime = ride.requestTime.toDate();
            } else if (ride.requestTime?.seconds) {
              requestTime = new Date(ride.requestTime.seconds * 1000);
            } else {
              requestTime = new Date(ride.requestTime);
            }
            const wait = (Date.now() - requestTime.getTime()) / (1000 * 60);
            return sum + wait;
          } catch (error) {
            console.error('Error parsing request time:', error);
            return sum;
          }
        }, 0) / pendingRides.length
      )
    : 0;

  const totalRidesToday = 0;

  if (error) {
    return (
      <Layout role="admin">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Real-time fleet management and analytics</p>

          {/* ✅ ADDED BUTTON HERE (ONLY CHANGE YOU REQUESTED) */}
          <Button
            className="mt-4"
            onClick={async () => {
              await addTestDrivers();
              await addTestRides();
              toast({ title: 'Test data added!' });
            }}
          >
            Add Test Data
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            title="Active Buses"
            value={activeDrivers.filter(d => d.status === 'active').length}
            description="Currently on route"
            icon={Bus}
            variant="success"
            trend="up"
            trendValue={`${activeDrivers.length} total`}
          />
          <StatCard
            title="Pending Requests"
            value={pendingRides.length}
            description="Waiting for assignment"
            icon={AlertCircle}
            variant={pendingRides.length > 5 ? "warning" : "default"}
          />
          <StatCard
            title="Avg Wait Time"
            value={`${avgWaitTime} min`}
            description="Current average"
            icon={Clock}
            variant="primary"
            trend={avgWaitTime > 5 ? "up" : "down"}
            trendValue={`${avgWaitTime > 5 ? 'High' : 'Normal'}`}
          />
          <StatCard
            title="Total Rides Today"
            value={totalRidesToday.toString()}
            description="Completed rides"
            icon={TrendingUp}
            variant="default"
          />
        </div>

        {/* Rest of your file remains unchanged */}
        {/* ... */}
      </div>
    </Layout>
  );
}
