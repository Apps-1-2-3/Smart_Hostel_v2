import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { studentApi, AttendanceDTO, MealMenuDTO } from '@/services/api';
import { 
  LogIn, 
  LogOut, 
  QrCode, 
  UtensilsCrossed, 
  Home, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<'IN' | 'OUT'>('IN');
  const [recentAttendance, setRecentAttendance] = useState<AttendanceDTO[]>([]);
  const [todayMenu, setTodayMenu] = useState<MealMenuDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.studentId) return;
      
      setIsLoading(true);
      try {
        const [attendanceData, menuData, statusData] = await Promise.all([
          studentApi.getAttendanceHistory(user.studentId).catch(() => []),
          studentApi.getTodaysMenu().catch(() => []),
          studentApi.getCurrentStatus(user.studentId).catch(() => null),
        ]);
        
        setRecentAttendance(attendanceData.slice(0, 5));
        setTodayMenu(menuData);
        if (statusData) {
          setCurrentStatus(statusData.type);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.studentId]);

  const handleMarkAttendance = async (type: 'IN' | 'OUT') => {
    if (!user?.studentId) return;
    
    setIsMarkingAttendance(true);
    try {
      const result = await studentApi.markAttendance(user.studentId, type);
      setCurrentStatus(type);
      setRecentAttendance(prev => [result, ...prev.slice(0, 4)]);
      toast({
        title: `Marked ${type}`,
        description: `Attendance recorded at ${format(new Date(), 'h:mm a')}`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to mark attendance',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  // Group menu by meal time
  const menuByMeal = todayMenu.reduce((acc, item) => {
    const mealTime = item.mealTime.toLowerCase();
    if (!acc[mealTime]) acc[mealTime] = [];
    acc[mealTime].push(item.menuItem);
    return acc;
  }, {} as Record<string, string[]>);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Badge 
            variant={currentStatus === 'IN' ? 'default' : 'secondary'}
            className={`text-sm px-4 py-2 ${currentStatus === 'IN' ? 'bg-success text-success-foreground' : ''}`}
          >
            {currentStatus === 'IN' ? (
              <><CheckCircle2 className="h-4 w-4 mr-1" /> Currently IN</>
            ) : (
              <><XCircle className="h-4 w-4 mr-1" /> Currently OUT</>
            )}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                <Home className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="font-display text-xl font-semibold">{user?.roomNumber || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Records</p>
                <p className="font-display text-xl font-semibold">{recentAttendance.length} entries</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <UtensilsCrossed className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meals Today</p>
                <p className="font-display text-xl font-semibold">{Object.keys(menuByMeal).length} / 3</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Actions & Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mark Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Mark Attendance
              </CardTitle>
              <CardDescription>
                Record your entry or exit from the hostel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={currentStatus === 'OUT' ? 'gradient' : 'secondary'}
                  size="lg"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleMarkAttendance('IN')}
                  disabled={isMarkingAttendance}
                >
                  {isMarkingAttendance ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <LogIn className="h-6 w-6" />
                  )}
                  <span>Mark IN</span>
                </Button>
                <Button
                  variant={currentStatus === 'IN' ? 'accent' : 'secondary'}
                  size="lg"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleMarkAttendance('OUT')}
                  disabled={isMarkingAttendance}
                >
                  {isMarkingAttendance ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <LogOut className="h-6 w-6" />
                  )}
                  <span>Mark OUT</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Last marked: {recentAttendance[0] ? format(new Date(recentAttendance[0].timestamp), 'h:mm a') : 'N/A'} • Auto-captured via QR
              </p>
            </CardContent>
          </Card>

          {/* Today's Menu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Today's Menu
              </CardTitle>
              <CardDescription>
                Hostel mess menu for {format(new Date(), 'MMMM d')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(menuByMeal).length > 0 ? (
                  Object.entries(menuByMeal).map(([mealTime, items]) => (
                    <div key={mealTime} className="flex items-start gap-3">
                      <Badge variant="outline" className="capitalize min-w-[80px] justify-center">
                        {mealTime}
                      </Badge>
                      <p className="text-sm text-muted-foreground flex-1">
                        {items.join(', ')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No menu available for today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your attendance logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttendance.length > 0 ? (
                recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      {record.type === 'IN' ? (
                        <LogIn className="h-4 w-4 text-success" />
                      ) : (
                        <LogOut className="h-4 w-4 text-accent" />
                      )}
                      <span className="font-medium capitalize">{record.type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(record.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No attendance records found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
