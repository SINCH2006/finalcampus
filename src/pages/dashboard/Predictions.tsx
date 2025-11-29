import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MapPin, Clock } from 'lucide-react';
import { mockPredictions, mockDemandData } from '@/utils/mockData';

export default function Predictions() {
  return (
    <Layout role="dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Demand Predictions</h2>
          <p className="text-muted-foreground">AI-powered forecasting and analytics</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Peak Hour Prediction</p>
                <p className="text-3xl font-bold text-primary">12:30 PM</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Expected demand: <span className="font-medium text-foreground">110 requests</span>
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Hotspot Zone</p>
                <p className="text-3xl font-bold text-warning">Engineering</p>
              </div>
              <MapPin className="h-8 w-8 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">
              Demand: <span className="font-medium text-foreground">78 requests/hr</span>
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Trend</p>
                <p className="text-3xl font-bold text-success">+18%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">
              vs last week
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Hourly Demand Forecast</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPredictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="demand" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Top Demand Zones</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDemandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="zone" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="demand" 
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Insights</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium">Engineering Block surge predicted</p>
                  <p className="text-sm text-muted-foreground">
                    Deploy 2 additional buses at 12:00 PM
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-warning mt-2" />
                <div>
                  <p className="font-medium">Hostel area demand stable</p>
                  <p className="text-sm text-muted-foreground">
                    Current fleet allocation sufficient
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-success mt-2" />
                <div>
                  <p className="font-medium">Improved response times</p>
                  <p className="text-sm text-muted-foreground">
                    Average wait time down 15% this week
                  </p>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Recommendations</h3>
            <ul className="space-y-3">
              <li className="p-3 bg-primary/5 rounded-lg">
                <p className="font-medium text-sm">Add bus route</p>
                <p className="text-xs text-muted-foreground">
                  Library → Sports Complex (high demand corridor)
                </p>
              </li>
              <li className="p-3 bg-warning/5 rounded-lg">
                <p className="font-medium text-sm">Adjust timing</p>
                <p className="text-xs text-muted-foreground">
                  Increase frequency between 12-2 PM
                </p>
              </li>
              <li className="p-3 bg-success/5 rounded-lg">
                <p className="font-medium text-sm">Optimize idle time</p>
                <p className="text-xs text-muted-foreground">
                  Reduce vehicle idle time by 12%
                </p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
