import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import StudentLogin from "@/pages/login/StudentLogin";
import DriverLogin from "@/pages/login/DriverLogin";
import AdminLogin from "@/pages/login/AdminLogin";

import StudentDashboard from "@/pages/student/Dashboard";
import DriverDashboard from "@/pages/driver/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/login/driver" element={<DriverLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />

      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/driver/dashboard" element={<DriverDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}
