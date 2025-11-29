import { useState } from 'react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import MapContainer from '@/components/MapContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { mockRides, mockVehicles } from '@/utils/mockData';

export default function DriverDashboard() {
  const [currentRide] = useState(mockRides.find(r => r.status === 'accepted'));
  const myVehicle = mockVehicles[0];

  return (
    <Layout role="driver">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome, {myVehicle.driverName}! 👋</h2>
          <p className="text-muted-foreground">Vehicle: {myVehicle.vehicleNumber}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            title="Today's Rides"
            value="12"
            description="Completed successfully"
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Current Passengers"
            value={myVehicle.currentPassengers}
            description={`Capacity: ${myVehicle.capacity}`}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Next Stop"
            value="8 mins"
            description="Engineering Block"
            icon={Clock}
            variant="warning"
          />
        </div>

        {currentRide ? (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Current Assignment</h3>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-sm text-muted-foreground">Student</p>
                    <p className="font-medium">{currentRide.studentName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup</p>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {currentRide.pickup}
                      </p>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div>
                      <p className="text-sm text-muted-foreground">Destination</p>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" />
                        {currentRide.destination}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Request Time</p>
                    <p className="font-medium">
                      {new Date(currentRide.requestTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1 gap-2">
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
                <Button className="flex-1 gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Start Ride
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
            <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">No pending ride assignments</p>
          </Card>
        )}

        <Card className="p-4">
          <h3 className="text-lg font-bold mb-4">Current Route</h3>
          <div className="h-[400px] rounded-lg overflow-hidden">
            <MapContainer
              vehicles={[myVehicle]}
              center={myVehicle.location}
              markers={[
                { lat: 40.7128, lng: -74.0060, label: 'Main Gate' },
                { lat: 40.7228, lng: -74.0160, label: 'Engineering Block' }
              ]}
            />
          </div>
        </Card>
      </div>
    </Layout>
  );
}
