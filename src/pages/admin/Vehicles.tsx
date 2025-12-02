// src/pages/admin/Vehicles.tsx
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subscribeToActiveDrivers, type Driver } from '@/firebase';
import { Bus, MapPin, Users, Phone, Navigation, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import Leaflet components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for different statuses
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export default function AdminVehicles() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const unsubscribe = subscribeToActiveDrivers((activeDrivers) => {
      console.log('Drivers with locations:', activeDrivers);
      setDrivers(activeDrivers);
      setLoading(false);
      setLastUpdate(new Date());
    });

    return () => unsubscribe();
  }, []);

  // Filter drivers with valid locations
  const driversWithLocation = drivers.filter(
    d => d.currentLocation && 
         typeof d.currentLocation.latitude === 'number' && 
         typeof d.currentLocation.longitude === 'number'
  );

  // Calculate map center (average of all vehicle positions)
  const mapCenter = driversWithLocation.length > 0
    ? {
        lat: driversWithLocation.reduce((sum, d) => sum + d.currentLocation!.latitude, 0) / driversWithLocation.length,
        lng: driversWithLocation.reduce((sum, d) => sum + d.currentLocation!.longitude, 0) / driversWithLocation.length
      }
    : { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore

  const activeVehicles = drivers.filter(d => d.status === 'active').length;
  const idleVehicles = drivers.filter(d => d.status === 'idle').length;
  const totalPassengers = drivers.reduce((sum, d) => sum + (d.currentPassengers || 0), 0);
  const totalCapacity = drivers.reduce((sum, d) => sum + (d.capacity || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'; // green
      case 'idle': return '#f59e0b'; // yellow
      default: return '#ef4444'; // red
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Vehicle Tracking</h2>
            <p className="text-muted-foreground">Real-time location and status of fleet vehicles</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Fleet Summary */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold">{drivers.length}</p>
              </div>
              <Bus className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">{activeVehicles}</p>
              </div>
              <Navigation className="h-8 w-8 text-success" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Idle</p>
                <p className="text-2xl font-bold text-warning">{idleVehicles}</p>
              </div>
              <MapPin className="h-8 w-8 text-warning" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Passengers</p>
                <p className="text-2xl font-bold">{totalPassengers}/{totalCapacity}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Real-time Map */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Vehicle Locations</h3>
            {driversWithLocation.length > 0 && (
              <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                {driversWithLocation.length} vehicles transmitting location
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="h-[500px] flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Loading vehicle locations...</p>
            </div>
          ) : driversWithLocation.length === 0 ? (
            <div className="h-[500px] flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center space-y-2">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No vehicles currently sharing location</p>
                <p className="text-sm text-muted-foreground">
                  Drivers must enable location sharing in their app
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[500px] rounded-lg overflow-hidden">
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {driversWithLocation.map((driver) => (
                  <Marker
                    key={driver.id}
                    position={[driver.currentLocation!.latitude, driver.currentLocation!.longitude]}
                    icon={createCustomIcon(getStatusColor(driver.status))}
                  >
                    <Popup>
                      <div className="space-y-1 min-w-[200px]">
                        <p className="font-bold">{driver.vehicleNumber}</p>
                        <p className="text-sm">{driver.name}</p>
                        <p className="text-sm">{driver.currentPassengers}/{driver.capacity} passengers</p>
                        <p className="text-xs text-muted-foreground">
                          Status: <span className={`font-medium ${
                            driver.status === 'active' ? 'text-success' : 'text-warning'
                          }`}>{driver.status.toUpperCase()}</span>
                        </p>
                        {driver.currentLocation?.speed !== undefined && (
                          <p className="text-xs">Speed: {Math.round(driver.currentLocation.speed)} km/h</p>
                        )}
                        {driver.currentLocation?.timestamp && (
                          <p className="text-xs text-muted-foreground">
                            Updated: {new Date(driver.currentLocation.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </Card>

        {/* Vehicle Details Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Loading fleet data...
            </div>
          ) : drivers.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Alert>
                <AlertDescription>
                  No drivers are currently registered in the system.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            drivers.map((driver) => {
              const utilizationPercent = driver.capacity > 0 
                ? Math.round((driver.currentPassengers / driver.capacity) * 100)
                : 0;
              
              return (
                <Card 
                  key={driver.id} 
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedDriver === driver.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedDriver(
                    selectedDriver === driver.id ? null : driver.id
                  )}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <Bus className="h-4 w-4 text-primary" />
                        {driver.vehicleNumber}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        driver.status === 'active' ? 'bg-success/10 text-success' :
                        driver.status === 'idle' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {driver.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Driver Info */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Driver:</span>
                        <span className="font-medium">{driver.name}</span>
                      </div>
                      
                      {driver.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{driver.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium uppercase">{driver.vehicleType || 'BUS'}</span>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">
                          {driver.currentPassengers || 0}/{driver.capacity || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            utilizationPercent >= 90 ? 'bg-destructive' :
                            utilizationPercent >= 70 ? 'bg-warning' :
                            'bg-success'
                          }`}
                          style={{ width: `${utilizationPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Location Status */}
                    <div className="pt-2 border-t">
                      {driver.currentLocation && 
                       typeof driver.currentLocation.latitude === 'number' ? (
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1 text-success">
                            <MapPin className="h-3 w-3" />
                            <span>Location tracking active</span>
                          </div>
                          <p className="text-muted-foreground">
                            Lat: {driver.currentLocation.latitude.toFixed(4)}, 
                            Lng: {driver.currentLocation.longitude.toFixed(4)}
                          </p>
                          {driver.currentLocation.speed !== undefined && (
                            <p className="text-muted-foreground">
                              Speed: {Math.round(driver.currentLocation.speed)} km/h
                            </p>
                          )}
                          {driver.currentLocation.timestamp && (
                            <p className="text-muted-foreground">
                              Updated: {new Date(driver.currentLocation.timestamp).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>Location not shared</span>
                        </div>
                      )}
                    </div>

                    {/* Route */}
                    {driver.route && (
                      <p className="text-xs text-muted-foreground pt-1 border-t">
                        Route: {driver.route}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}