import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Student Pages
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentAttendance from "@/pages/student/StudentAttendance";
import StudentMeals from "@/pages/student/StudentMeals";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminStudents from "@/pages/admin/AdminStudents";
import AdminAttendance from "@/pages/admin/AdminAttendance";
import AdminRooms from "@/pages/admin/AdminRooms";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

// Mess Staff Pages
import MessDashboard from "@/pages/mess/MessDashboard";
import MessDemand from "@/pages/mess/MessDemand";
import MessStatistics from "@/pages/mess/MessStatistics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login\" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/meals"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentMeals />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Mess Staff Routes */}
            <Route
              path="/mess"
              element={
                <ProtectedRoute allowedRoles={['mess_staff']}>
                  <MessDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mess/demand"
              element={
                <ProtectedRoute allowedRoles={['mess_staff']}>
                  <MessDemand />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mess/statistics"
              element={
                <ProtectedRoute allowedRoles={['mess_staff']}>
                  <MessStatistics />
                </ProtectedRoute>
              }
            />

            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;