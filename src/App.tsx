import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Student Portal Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentRequest from "./pages/student/Request";
import StudentRides from "./pages/student/Rides";
import StudentProfile from "./pages/student/Profile";

// Driver Portal Pages
import DriverDashboard from "./pages/driver/Dashboard";
import DriverLocation from "./pages/driver/Location";

// Admin Portal Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVehicles from "./pages/admin/Vehicles";
import AdminHeatmap from "./pages/admin/Heatmap";
import AdminReports from "./pages/admin/Reports";

// Live Dashboard Pages
import LiveDashboard from "./pages/dashboard/Live";
import Predictions from "./pages/dashboard/Predictions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Student Portal Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/request" element={<StudentRequest />} />
          <Route path="/student/rides" element={<StudentRides />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          
          {/* Driver Portal Routes */}
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/location" element={<DriverLocation />} />
          
          {/* Admin Portal Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/vehicles" element={<AdminVehicles />} />
          <Route path="/admin/heatmap" element={<AdminHeatmap />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          
          {/* Live Dashboard Routes */}
          <Route path="/dashboard/live" element={<LiveDashboard />} />
          <Route path="/dashboard/predictions" element={<Predictions />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
