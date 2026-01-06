import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { studentApi, AttendanceDTO } from '@/services/api';
import { 
  Calendar as CalendarIcon, 
  LogIn, 
  LogOut, 
  Clock,
  Filter,
  Download,
  Loader2,
} from 'lucide-react';
import { format, isToday, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterType, setFilterType] = useState<'all' | 'IN' | 'OUT'>('all');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<'IN' | 'OUT'>('IN');

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.studentId) return;
      
      setIsLoading(true);
      try {
        const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        
        const [records, status] = await Promise.all([
          studentApi.getAttendanceByRange(user.studentId, startDate, endDate),
          studentApi.getCurrentStatus(user.studentId).catch(() => null),
        ]);
        
        setAttendanceRecords(records);
        if (status) {
          setCurrentStatus(status.type);
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [user?.studentId]);

  // Filter records based on selected date and type
  const filteredRecords = attendanceRecords.filter(record => {
    const dateMatch = selectedDate ? isSameDay(new Date(record.timestamp), selectedDate) : true;
    const typeMatch = filterType === 'all' || record.type === filterType;
    return dateMatch && typeMatch;
  });

  // Calculate monthly stats
  const presentDays = new Set(
    attendanceRecords
      .filter(r => r.type === 'IN')
      .map(r => format(new Date(r.timestamp), 'yyyy-MM-dd'))
  ).size;
  const totalDays = new Date().getDate();
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Attendance History
            </h1>
            <p className="text-muted-foreground mt-1">
              View and track your hostel attendance records
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="font-display text-3xl font-bold text-foreground">{presentDays}</p>
                  <p className="text-xs text-muted-foreground">days present</p>
                </div>
                <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="font-display text-3xl font-bold text-success">{attendancePercentage}%</p>
                  <p className="text-xs text-muted-foreground">this month</p>
                </div>
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(attendancePercentage / 100) * 150.8} 150.8`}
                      className="text-success"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Status</p>
                  <p className="font-display text-xl font-bold text-foreground">
                    {currentStatus === 'IN' ? 'Present' : 'Out'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {attendanceRecords[0] ? `Last: ${format(new Date(attendanceRecords[0].timestamp), 'h:mm a')}` : 'No records'}
                  </p>
                </div>
                <Badge variant="default" className={currentStatus === 'IN' ? 'bg-success text-success-foreground' : ''}>
                  {currentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Records */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Entry Type</label>
                <div className="flex gap-2">
                  {(['all', 'IN', 'OUT'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 capitalize"
                      onClick={() => setFilterType(type)}
                    >
                      {type.toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedDate(new Date());
                  setFilterType('all');
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Records List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Attendance Records
              </CardTitle>
              <CardDescription>
                {selectedDate
                  ? `Showing records for ${format(selectedDate, 'MMMM d, yyyy')}`
                  : 'Showing all records'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center',
                          record.type === 'IN' ? 'bg-success/10' : 'bg-accent/10'
                        )}>
                          {record.type === 'IN' ? (
                            <LogIn className="h-5 w-5 text-success" />
                          ) : (
                            <LogOut className="h-5 w-5 text-accent" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{record.type === 'IN' ? 'Checked In' : 'Checked Out'}</p>
                          <p className="text-sm text-muted-foreground">
                            {isToday(new Date(record.timestamp)) ? 'Today' : format(new Date(record.timestamp), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{format(new Date(record.timestamp), 'h:mm a')}</p>
                        <Badge variant="outline" className="text-xs">
                          {record.type}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No attendance records found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
