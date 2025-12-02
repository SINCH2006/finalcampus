// src/pages/admin/Reports.tsx
import { useState, useEffect } from 'react';
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
import { Download, Filter, Calendar } from 'lucide-react';
import { getHistoricalRideData, type Ride } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export default function AdminReports() {
  const { toast } = useToast();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');

  useEffect(() => {
    loadRides();
  }, [dateRange]);

  const loadRides = async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const ridesData = await getHistoricalRideData(days);
      setRides(ridesData);
    } catch (error) {
      console.error('Error loading rides:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ride data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter rides
  const filteredRides = rides.filter(ride => {
    if (statusFilter === 'all') return true;
    return ride.status === statusFilter;
  });

  // Export to CSV
  const handleExport = () => {
    try {
      // Prepare CSV data
      const headers = [
        'Ride ID',
        'Student Name',
        'Student ID',
        'Pickup',
        'Destination',
        'Driver Name',
        'Vehicle Number',
        'Type',
        'Status',
        'Request Time',
        'Assigned Time',
        'Pickup Time',
        'Completed Time'
      ];

      const csvRows = [
        headers.join(','),
        ...filteredRides.map(ride => [
          ride.id,
          ride.studentName,
          ride.studentId,
          `"${ride.pickup}"`,
          `"${ride.destination}"`,
          ride.driverName || ride.assignedDriver?.driverName || '',
          ride.vehicleNumber || ride.assignedDriver?.vehicleNumber || '',
          ride.type,
          ride.status,
          new Date(ride.requestTime).toISOString(),
          ride.assignedTime ? new Date(ride.assignedTime).toISOString() : '',
          ride.pickupTime ? new Date(ride.pickupTime).toISOString() : '',
          ride.completedTime ? new Date(ride.completedTime).toISOString() : ''
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ride-reports-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Exported ${filteredRides.length} rides to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        variant: 'destructive'
      });
    }
  };

  // Calculate statistics
  const stats = {
    total: filteredRides.length,
    completed: filteredRides.filter(r => r.status === 'completed').length,
    pending: filteredRides.filter(r => r.status === 'pending').length,
    inProgress: filteredRides.filter(r => r.status === 'in-progress').length,
    cancelled: filteredRides.filter(r => r.status === 'cancelled').length,
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Ride Reports</h2>
            <p className="text-muted-foreground">
              View, analyze, and export ride data
            </p>
          </div>
          <Button onClick={handleExport} className="gap-2" disabled={loading || filteredRides.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Rides</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Data Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Request Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading ride data...
                    </TableCell>
                  </TableRow>
                ) : filteredRides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No rides found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRides.map((ride) => {
                    // Calculate ride duration if completed
                    let duration = '';
                    if (ride.completedTime && ride.pickupTime) {
                      const mins = Math.round(
                        (new Date(ride.completedTime).getTime() - 
                         new Date(ride.pickupTime).getTime()) / (1000 * 60)
                      );
                      duration = `${mins} min`;
                    }

                    return (
                      <TableRow key={ride.id}>
                        <TableCell className="font-mono text-xs">
                          {ride.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ride.studentName}</p>
                            <p className="text-xs text-muted-foreground">{ride.studentId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="text-sm truncate">{ride.pickup}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              → {ride.destination}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(ride.driverName || ride.assignedDriver?.driverName) ? (
                            <div>
                              <p className="text-sm">{ride.driverName || ride.assignedDriver?.driverName}</p>
                              <p className="text-xs text-muted-foreground">
                                {ride.vehicleNumber || ride.assignedDriver?.vehicleNumber}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ride.status === 'completed' ? 'bg-success/10 text-success' :
                            ride.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                            ride.status === 'pending' ? 'bg-warning/10 text-warning' :
                            ride.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                            'bg-secondary/10 text-secondary'
                          }`}>
                            {ride.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {duration || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Summary */}
        {!loading && filteredRides.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''} 
            {' '}from the last {dateRange} day{dateRange !== '1' ? 's' : ''}
          </div>
        )}
      </div>
    </Layout>
  );
}
