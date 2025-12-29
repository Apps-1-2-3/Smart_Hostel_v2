import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { roomAllocations, mockStudents } from '@/data/mockData';
import {
  Building2,
  Users,
  Home,
  Download,
} from 'lucide-react';

const AdminRooms: React.FC = () => {
  const totalRooms = roomAllocations.reduce((acc, b) => acc + b.totalRooms, 0);
  const occupiedRooms = roomAllocations.reduce((acc, b) => acc + b.occupied, 0);
  const vacantRooms = roomAllocations.reduce((acc, b) => acc + b.vacant, 0);

  // Group students by block
  const studentsByBlock = mockStudents.reduce((acc, student) => {
    const block = student.roomNumber.charAt(0);
    if (!acc[block]) acc[block] = [];
    acc[block].push(student);
    return acc;
  }, {} as Record<string, typeof mockStudents>);

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

        {/* Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roomAllocations.map((block) => {
            const percentage = Math.round((block.occupied / block.totalRooms) * 100);
            const students = studentsByBlock[block.block] || [];

            return (
              <Card key={block.block}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline" className="text-lg font-mono px-3 py-1">
                        Block {block.block}
                      </Badge>
                    </CardTitle>
                    <Badge 
                      variant={percentage >= 90 ? 'destructive' : percentage >= 70 ? 'default' : 'secondary'}
                    >
                      {percentage}% Full
                    </Badge>
                  </div>
                  <CardDescription>
                    {block.occupied} occupied • {block.vacant} vacant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={percentage} className="h-2" />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Recent Residents</p>
                    <div className="space-y-2">
                      {students.slice(0, 3).map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.roomNumber}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={student.currentStatus === 'in' ? 'border-success text-success' : ''}
                          >
                            {student.currentStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminRooms;