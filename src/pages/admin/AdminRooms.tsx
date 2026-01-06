import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { adminApi, RoomDTO, StudentDTO } from '@/services/api';
import {
  Building2,
  Users,
  Home,
  Download,
  Loader2,
} from 'lucide-react';

const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [roomsData, studentsData] = await Promise.all([
          adminApi.getRooms(),
          adminApi.getStudents(),
        ]);
        setRooms(roomsData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group rooms by hostel
  const roomsByHostel = rooms.reduce((acc, room) => {
    if (!acc[room.hostelNo]) {
      acc[room.hostelNo] = { rooms: [], totalCapacity: 0, currentOccupancy: 0 };
    }
    acc[room.hostelNo].rooms.push(room);
    acc[room.hostelNo].totalCapacity += room.capacity;
    acc[room.hostelNo].currentOccupancy += room.currentOccupancy;
    return acc;
  }, {} as Record<string, { rooms: RoomDTO[]; totalCapacity: number; currentOccupancy: number }>);

  // Group students by hostel block (first letter of room)
  const studentsByBlock = students.reduce((acc, student) => {
    const block = student.roomNo?.charAt(0) || 'Unknown';
    if (!acc[block]) acc[block] = [];
    acc[block].push(student);
    return acc;
  }, {} as Record<string, StudentDTO[]>);

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.currentOccupancy > 0).length;
  const vacantRooms = rooms.filter(r => r.currentOccupancy === 0).length;

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
              Room Allocations
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage hostel room assignments and occupancy
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Rooms</p>
                  <p className="font-display text-3xl font-bold">{totalRooms}</p>
                </div>
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                  <p className="font-display text-3xl font-bold text-success">{occupiedRooms}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vacant</p>
                  <p className="font-display text-3xl font-bold text-accent">{vacantRooms}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hostels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(roomsByHostel).map(([hostelNo, data]) => {
            const percentage = data.totalCapacity > 0 
              ? Math.round((data.currentOccupancy / data.totalCapacity) * 100) 
              : 0;
            const blockStudents = studentsByBlock[hostelNo] || [];

            return (
              <Card key={hostelNo}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline" className="text-lg font-mono px-3 py-1">
                        Block {hostelNo}
                      </Badge>
                    </CardTitle>
                    <Badge 
                      variant={percentage >= 90 ? 'destructive' : percentage >= 70 ? 'default' : 'secondary'}
                    >
                      {percentage}% Full
                    </Badge>
                  </div>
                  <CardDescription>
                    {data.currentOccupancy} occupied • {data.totalCapacity - data.currentOccupancy} vacant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={percentage} className="h-2" />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Recent Residents</p>
                    <div className="space-y-2">
                      {blockStudents.slice(0, 3).map((student) => (
                        <div
                          key={student.studentId}
                          className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                              {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{student.fullName}</p>
                              <p className="text-xs text-muted-foreground">{student.roomNo}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={student.status === 'IN' ? 'border-success text-success' : ''}
                          >
                            {student.status}
                          </Badge>
                        </div>
                      ))}
                      {blockStudents.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No students in this block
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {Object.keys(roomsByHostel).length === 0 && (
            <Card className="md:col-span-3">
              <CardContent className="p-8 text-center text-muted-foreground">
                No room data available
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminRooms;
