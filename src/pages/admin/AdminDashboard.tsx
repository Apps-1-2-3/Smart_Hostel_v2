import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminApi, AnalyticsDTO, StudentDTO, MealDemandDTO } from '@/services/api';
import {
  Users,
  Building2,
  UtensilsCrossed,
  LogIn,
  LogOut,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsDTO | null>(null);
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [mealDemand, setMealDemand] = useState<MealDemandDTO | null>(null);
  const [roomOccupancy, setRoomOccupancy] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [analyticsData, studentsData, demandData, occupancyData] = await Promise.all([
          adminApi.getAnalytics(),
          adminApi.getStudents(),
          adminApi.getMealDemand(format(new Date(), 'yyyy-MM-dd')),
          adminApi.getRoomOccupancy(),
        ]);
        
        setAnalytics(analyticsData);
        setStudents(studentsData);
        setMealDemand(demandData);
        setRoomOccupancy(occupancyData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalStudents = analytics?.totalStudents || students.length;
  const studentsIn = analytics?.presentToday || students.filter(s => s.status === 'IN').length;
  const studentsOut = analytics?.absentToday || students.filter(s => s.status === 'OUT').length;

  const totalRooms = Object.values(roomOccupancy).reduce((a, b) => a + b, 0);
  const occupancyRate = analytics?.attendancePercentage || 0;

  const mealData = mealDemand?.mealStats 
    ? Object.entries(mealDemand.mealStats).map(([name, stats]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        attending: stats.eating,
        optOut: stats.optedOut,
      }))
    : [];

  const statusData = [
    { name: 'In Hostel', value: studentsIn, color: 'hsl(var(--success))' },
    { name: 'Out', value: studentsOut, color: 'hsl(var(--accent))' },
  ];

  const roomAllocations = Object.entries(roomOccupancy).map(([block, occupied]) => ({
    block,
    occupied,
    totalRooms: Math.ceil(occupied * 1.2), // Estimate total rooms
    vacant: Math.ceil(occupied * 0.2),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of hostel operations and student management
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="font-display text-3xl font-bold">{totalStudents}</p>
                </div>
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Currently In</p>
                  <p className="font-display text-3xl font-bold text-success">{studentsIn}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Currently Out</p>
                  <p className="font-display text-3xl font-bold text-accent">{studentsOut}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <LogOut className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="font-display text-3xl font-bold">{occupancyRate}%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Current Student Status
              </CardTitle>
              <CardDescription>Real-time hostel occupancy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meal Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Today's Meal Attendance
              </CardTitle>
              <CardDescription>Expected vs Opt-out students</CardDescription>
            </CardHeader>
            <CardContent>
              {mealData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mealData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="attending" fill="hsl(var(--primary))" name="Attending" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="optOut" fill="hsl(var(--muted))" name="Opt-out" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  No meal data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Room Blocks & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Allocation Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Room Allocation by Block
              </CardTitle>
              <CardDescription>Current occupancy across hostel blocks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roomAllocations.length > 0 ? (
                  roomAllocations.map((block) => {
                    const percentage = Math.round((block.occupied / block.totalRooms) * 100);
                    return (
                      <div key={block.block} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              Block {block.block}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {block.occupied} / {block.totalRooms} rooms
                            </span>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full gradient-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No room allocation data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                Alerts
              </CardTitle>
              <CardDescription>Requires attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-accent">Late Return</p>
                  <p className="text-xs text-muted-foreground">{studentsOut > 5 ? studentsOut - 5 : 0} students past curfew</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary">Room Maintenance</p>
                  <p className="text-xs text-muted-foreground">Block B - Plumbing issue</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm font-medium text-success">All Clear</p>
                  <p className="text-xs text-muted-foreground">No pending requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
