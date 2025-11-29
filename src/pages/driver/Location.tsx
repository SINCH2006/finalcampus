import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import MapContainer from '@/components/MapContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { mockVehicles } from '@/utils/mockData';

export default function DriverLocation() {
  const [vehicle, setVehicle] = useState(mockVehicles[0]);
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setVehicle(prev => ({
        ...prev,
        location: {
          lat: prev.location.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.location.lng + (Math.random() - 0.5) * 0.001
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isTracking]);

  return (
    <Layout role="driver">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Live Location</h2>
            <p className="text-muted-foreground">GPS tracking active</p>
          </div>
          <Button
            variant={isTracking ? "destructive" : "default"}
            onClick={() => setIsTracking(!isTracking)}
            className="gap-2"
          >
            <Navigation className="h-4 w-4" />
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Button>
        </div>

        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Location</p>
              <p className="font-mono text-sm">
                {vehicle.location.lat.toFixed(6)}, {vehicle.location.lng.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  isTracking ? 'bg-success animate-pulse' : 'bg-muted'
                }`} />
                <span className="font-medium">
                  {isTracking ? 'Broadcasting' : 'Stopped'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-[500px] rounded-lg overflow-hidden">
            <MapContainer
              vehicles={[vehicle]}
              center={vehicle.location}
              zoom={15}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Route Information
          </h3>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Route:</span>{' '}
              <span className="font-medium">{vehicle.route}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Passengers:</span>{' '}
              <span className="font-medium">{vehicle.currentPassengers} / {vehicle.capacity}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Vehicle:</span>{' '}
              <span className="font-medium">{vehicle.vehicleNumber}</span>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
