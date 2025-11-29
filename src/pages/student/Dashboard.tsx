import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Bus, Calendar } from 'lucide-react';
import { mockRides } from '@/utils/mockData';

export default function StudentDashboard() {
  const upcomingRides = mockRides.filter(r => 
    ['pending', 'accepted', 'in-progress'].includes(r.status)
  ).slice(0, 3);

  return (
    <Layout role="student">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome back, Alice! 👋</h2>
          <p className="text-muted-foreground">Here's your transport overview</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            title="Next Bus ETA"
            value="8 mins"
            description="Bus CAM-001 to Engineering Block"
            icon={Clock}
            variant="primary"
          />
          <StatCard
            title="Active Rides"
            value={upcomingRides.length}
            description="You have active bookings"
            icon={Bus}
            variant="success"
          />
          <StatCard
            title="This Month"
            value="24"
            description="Total rides completed"
            icon={Calendar}
            variant="default"
          />
        </div>

        {/* Request Ride CTA */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Need a ride?</h3>
              <p className="text-muted-foreground mb-4">
                Book a bus or request a cab to your destination
              </p>
              <Link to="/student/request">
                <Button size="lg" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Request a Ride
                </Button>
              </Link>
            </div>
            <Bus className="h-24 w-24 text-primary/20 hidden md:block" />
          </div>
        </Card>

        {/* Upcoming Rides */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Upcoming Rides</h3>
            <Link to="/student/rides">
              <Button variant="ghost" size="sm">View All →</Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {upcomingRides.map((ride) => (
              <Card key={ride.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ride.status === 'in-progress' ? 'bg-success/10 text-success' :
                        ride.status === 'accepted' ? 'bg-primary/10 text-primary' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {ride.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ride.requestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{ride.pickup}</span>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span className="font-medium">{ride.destination}</span>
                      </div>
                    </div>
                    {ride.driverName && (
                      <p className="text-xs text-muted-foreground">
                        Driver: {ride.driverName}
                      </p>
                    )}
                  </div>
                  {ride.estimatedTime && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{ride.estimatedTime}</p>
                      <p className="text-xs text-muted-foreground">ETA</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
