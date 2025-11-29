import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, User } from 'lucide-react';
import { mockRides } from '@/utils/mockData';

export default function StudentRides() {
  const activeRides = mockRides.filter(r => 
    ['pending', 'accepted', 'in-progress'].includes(r.status)
  );
  const pastRides = mockRides.filter(r => 
    ['completed', 'cancelled'].includes(r.status)
  );

  const RideCard = ({ ride }: { ride: typeof mockRides[0] }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            ride.status === 'completed' ? 'bg-success/10 text-success' :
            ride.status === 'in-progress' ? 'bg-primary/10 text-primary' :
            ride.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
            ride.status === 'accepted' ? 'bg-success/10 text-success' :
            'bg-warning/10 text-warning'
          }`}>
            {ride.status.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-sm text-muted-foreground">
            {new Date(ride.requestTime).toLocaleDateString()} at{' '}
            {new Date(ride.requestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">{ride.pickup}</p>
              <p className="text-xs text-muted-foreground">Pickup location</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <p className="font-medium">{ride.destination}</p>
              <p className="text-xs text-muted-foreground">Destination</p>
            </div>
          </div>
        </div>

        {ride.driverName && (
          <div className="flex items-center gap-2 text-sm pt-2 border-t">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Driver:</span>
            <span className="font-medium">{ride.driverName}</span>
          </div>
        )}

        {ride.estimatedTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">ETA:</span>
            <span className="font-medium text-primary">{ride.estimatedTime}</span>
          </div>
        )}

        {ride.status === 'in-progress' && (
          <Button className="w-full" variant="outline">
            Track Live
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <Layout role="student">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">My Rides</h2>
          <p className="text-muted-foreground">View and manage your ride history</p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeRides.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastRides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeRides.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No active rides</p>
              </Card>
            ) : (
              activeRides.map((ride) => <RideCard key={ride.id} ride={ride} />)
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-6">
            {pastRides.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No past rides</p>
              </Card>
            ) : (
              pastRides.map((ride) => <RideCard key={ride.id} ride={ride} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
