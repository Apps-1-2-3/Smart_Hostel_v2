import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { todayMenu, mockAttendanceRecords } from '@/data/mockData';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<'in' | 'out'>('in');

  const handleMarkAttendance = (type: 'in' | 'out') => {
    setCurrentStatus(type);
    toast({
      title: `Marked ${type.toUpperCase()}`,
      description: `Attendance recorded at ${format(new Date(), 'h:mm a')}`,
    });
  };

  // Get recent attendance for this student
  const recentAttendance = mockAttendanceRecords
    .filter(r => r.studentId === '1')
    .slice(0, 5);

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
            variant={currentStatus === 'in' ? 'default' : 'secondary'}
            className={`text-sm px-4 py-2 ${currentStatus === 'in' ? 'bg-success text-success-foreground' : ''}`}
          >
            {currentStatus === 'in' ? (
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
                <p className="font-display text-xl font-semibold">{user?.roomNumber}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="font-display text-xl font-semibold">26 Days Present</p>
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
                <p className="font-display text-xl font-semibold">3 / 3</p>
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
                  variant={currentStatus === 'out' ? 'gradient' : 'secondary'}
                  size="lg"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleMarkAttendance('in')}
                >
                  <LogIn className="h-6 w-6" />
                  <span>Mark IN</span>
                </Button>
                <Button
                  variant={currentStatus === 'in' ? 'accent' : 'secondary'}
                  size="lg"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleMarkAttendance('out')}
                >
                  <LogOut className="h-6 w-6" />
                  <span>Mark OUT</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Last marked: {format(new Date(), 'h:mm a')} • Auto-captured via QR
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
                {todayMenu.map((meal) => (
                  <div key={meal.meal} className="flex items-start gap-3">
                    <Badge variant="outline" className="capitalize min-w-[80px] justify-center">
                      {meal.meal}
                    </Badge>
                    <p className="text-sm text-muted-foreground flex-1">
                      {meal.items.join(', ')}
                    </p>
                  </div>
                ))}
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
            <CardDescription>Your attendance logs from today</CardDescription>
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
                      {record.type === 'in' ? (
                        <LogIn className="h-4 w-4 text-success" />
                      ) : (
                        <LogOut className="h-4 w-4 text-accent" />
                      )}
                      <span className="font-medium capitalize">{record.type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(record.timestamp, 'h:mm a')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No attendance records for today
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