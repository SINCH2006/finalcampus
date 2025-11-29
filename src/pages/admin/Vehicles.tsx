import Layout from '@/components/Layout';
import MapContainer from '@/components/MapContainer';
import { Card } from '@/components/ui/card';
import { mockVehicles } from '@/utils/mockData';

export default function AdminVehicles() {
  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Vehicle Tracking</h2>
          <p className="text-muted-foreground">Real-time location of all fleet vehicles</p>
        </div>

        <Card className="p-4">
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              vehicles={mockVehicles.map(v => ({
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
          {mockVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-4">
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
                  <p><span className="text-muted-foreground">Driver:</span> {vehicle.driverName}</p>
                  <p><span className="text-muted-foreground">Type:</span> {vehicle.type.toUpperCase()}</p>
                  <p><span className="text-muted-foreground">Capacity:</span> {vehicle.currentPassengers}/{vehicle.capacity}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.route}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
