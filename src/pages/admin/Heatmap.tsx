import { useState } from 'react';
import Layout from '@/components/Layout';
import MapContainer from '@/components/MapContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockDemandData } from '@/utils/mockData';

export default function AdminHeatmap() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h'>('1h');

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Demand Heatmap</h2>
            <p className="text-muted-foreground">Visualize transport demand across campus</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === '1h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('1h')}
            >
              Next Hour
            </Button>
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >
              Next 24h
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="h-[500px] rounded-lg overflow-hidden">
            <MapContainer
              markers={mockDemandData.map(zone => ({
                lat: zone.lat,
                lng: zone.lng,
                label: `${zone.zone}: ${zone.demand} requests`,
                color: zone.demand > 60 ? 'hsl(var(--destructive))' :
                       zone.demand > 40 ? 'hsl(var(--warning))' :
                       'hsl(var(--success))'
              }))}
              center={{ lat: 40.7328, lng: -74.0260 }}
              zoom={13}
            />
          </div>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {mockDemandData.map((zone) => (
            <Card key={zone.zone} className="p-4">
              <h3 className="font-bold mb-2">{zone.zone}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{zone.demand}</span>
                  <span className="text-xs text-muted-foreground">requests</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      zone.demand > 60 ? 'bg-destructive' :
                      zone.demand > 40 ? 'bg-warning' :
                      'bg-success'
                    }`}
                    style={{ width: `${Math.min((zone.demand / 100) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {zone.demand > 60 ? 'High demand' :
                   zone.demand > 40 ? 'Medium demand' :
                   'Low demand'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
