import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import MapContainer from '@/components/MapContainer';
import { Card } from '@/components/ui/card';
import { mockVehicles } from '@/utils/mockData';
import { Bus, Users, Clock } from 'lucide-react';

export default function LiveDashboard() {
  const [vehicles, setVehicles] = useState(mockVehicles);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        location: {
          lat: v.location.lat + (Math.random() - 0.5) * 0.002,
          lng: v.location.lng + (Math.random() - 0.5) * 0.002
        }
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout role="dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Live Fleet Tracking</h2>
          <p className="text-muted-foreground">Real-time vehicle positions and status</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-primary/10 border-primary/20">
            <div className="flex items-center gap-3">
              <Bus className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{vehicles.filter(v => v.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active Vehicles</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-success/10 border-success/20">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">
                  {vehicles.reduce((sum, v) => sum + v.currentPassengers, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Passengers</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-warning/10 border-warning/20">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">2.8 min</p>
                <p className="text-sm text-muted-foreground">Avg Wait Time</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div>
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-muted-foreground">Fleet Utilization</p>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '94%' }} />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              vehicles={vehicles.map(v => ({
                id: v.id,
                location: v.location,
                name: `${v.vehicleNumber} - ${v.driverName}`,
                status: v.status
              }))}
              center={{ lat: 40.7228, lng: -74.0160 }}
              zoom={13}
            />
          </div>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{vehicle.vehicleNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'active' ? 'bg-success/10 text-success' :
                    vehicle.status === 'idle' ? 'bg-muted text-muted-foreground' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{vehicle.driverName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{vehicle.currentPassengers}/{vehicle.capacity}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(vehicle.currentPassengers / vehicle.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
