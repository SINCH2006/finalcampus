import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download } from 'lucide-react';
import { mockRides } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

export default function AdminReports() {
  const { toast } = useToast();
  const completedRides = mockRides.filter(r => r.status === 'completed');

  const handleExport = () => {
    toast({
      title: 'Export started',
      description: 'Your report will be downloaded shortly...',
    });
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Ride Reports</h2>
            <p className="text-muted-foreground">View and export completed ride data</p>
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedRides.map((ride) => (
                <TableRow key={ride.id}>
                  <TableCell className="font-mono text-xs">{ride.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ride.studentName}</p>
                      <p className="text-xs text-muted-foreground">{ride.studentId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{ride.pickup}</TableCell>
                  <TableCell>{ride.destination}</TableCell>
                  <TableCell>{ride.driverName || '-'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted rounded text-xs font-medium uppercase">
                      {ride.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(ride.requestTime).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ride.requestTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                      {ride.status.toUpperCase()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
