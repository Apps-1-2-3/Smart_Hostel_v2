import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { messApi, MealDemandDTO } from '@/services/api';
import {
  ChefHat,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

interface MealSlot {
  key: 'breakfast' | 'lunch' | 'dinner';
  label: string;
  startTime: number;
  endTime: number;
  stats: { total: number; optOut: number; attending: number };
}

const MessDemand: React.FC = () => {
  const [mealDemand, setMealDemand] = useState<MealDemandDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDemand = async () => {
      setIsLoading(true);
      try {
        const data = await messApi.getTodaysDemand();
        setMealDemand(data);
      } catch (error) {
        console.error('Failed to fetch meal demand:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemand();
  }, []);

  const now = new Date();
  const currentHour = now.getHours();

  const defaultStats = { total: 0, optOut: 0, attending: 0 };
  
  const mealSlots: MealSlot[] = [
    { 
      key: 'breakfast', 
      label: 'Breakfast', 
      startTime: 7.5, 
      endTime: 9, 
      stats: mealDemand?.mealStats?.breakfast 
        ? { total: mealDemand.mealStats.breakfast.expected, optOut: mealDemand.mealStats.breakfast.optedOut, attending: mealDemand.mealStats.breakfast.eating }
        : defaultStats 
    },
    { 
      key: 'lunch', 
      label: 'Lunch', 
      startTime: 12.5, 
      endTime: 14, 
      stats: mealDemand?.mealStats?.lunch 
        ? { total: mealDemand.mealStats.lunch.expected, optOut: mealDemand.mealStats.lunch.optedOut, attending: mealDemand.mealStats.lunch.eating }
        : defaultStats 
    },
    { 
      key: 'dinner', 
      label: 'Dinner', 
      startTime: 19.5, 
      endTime: 21, 
      stats: mealDemand?.mealStats?.dinner 
        ? { total: mealDemand.mealStats.dinner.expected, optOut: mealDemand.mealStats.dinner.optedOut, attending: mealDemand.mealStats.dinner.eating }
        : defaultStats 
    },
  ];

  const getMealStatus = (slot: MealSlot): 'upcoming' | 'active' | 'completed' => {
    const hourDecimal = currentHour + now.getMinutes() / 60;
    if (hourDecimal < slot.startTime) return 'upcoming';
    if (hourDecimal >= slot.startTime && hourDecimal <= slot.endTime) return 'active';
    return 'completed';
  };

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = (hour - h) * 60;
    return format(new Date().setHours(h, m), 'h:mm a');
  };

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
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Meal Demand
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time meal demand tracking and planning
          </p>
        </div>

        {/* Current Time */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Current Time</p>
                <p className="font-display text-lg font-semibold">{format(now, 'h:mm a')}</p>
              </div>
            </div>
            <Badge variant="default" className="gradient-primary">
              {mealSlots.find(s => getMealStatus(s) === 'active')?.label || 'No Active Meal'}
            </Badge>
          </CardContent>
        </Card>

        {/* Meal Demand Cards */}
        <div className="space-y-6">
          {mealSlots.map((slot) => {
            const status = getMealStatus(slot);
            const attendanceRate = slot.stats.total > 0 
              ? Math.round((slot.stats.attending / slot.stats.total) * 100) 
              : 0;

            return (
              <Card 
                key={slot.key}
                className={status === 'active' ? 'ring-2 ring-primary shadow-glow' : ''}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-primary" />
                      {slot.label}
                      {status === 'active' && (
                        <Badge className="bg-success text-success-foreground animate-pulse-soft">
                          NOW SERVING
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                  </div>
                  <CardDescription>
                    {status === 'upcoming' && 'Preparation in progress'}
                    {status === 'active' && 'Currently serving students'}
                    {status === 'completed' && 'Service completed for today'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Demand Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Expected Attendance</span>
                        <span className="text-2xl font-bold text-foreground">{slot.stats.attending}</span>
                      </div>
                      <Progress value={attendanceRate} className="h-3" />
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-secondary">
                          <p className="text-xl font-bold">{slot.stats.total}</p>
                          <p className="text-xs text-muted-foreground">Registered</p>
                        </div>
                        <div className="p-3 rounded-lg bg-success/10">
                          <p className="text-xl font-bold text-success">{slot.stats.attending}</p>
                          <p className="text-xs text-muted-foreground">Attending</p>
                        </div>
                        <div className="p-3 rounded-lg bg-accent/10">
                          <p className="text-xl font-bold text-accent">{slot.stats.optOut}</p>
                          <p className="text-xs text-muted-foreground">Opt-out</p>
                        </div>
                      </div>
                    </div>

                    {/* Preparation Notes */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Preparation Guidelines
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                          <span className="text-muted-foreground">Rice/Roti</span>
                          <span className="font-medium">{Math.ceil(slot.stats.attending * 0.15)} kg</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                          <span className="text-muted-foreground">Vegetables</span>
                          <span className="font-medium">{Math.ceil(slot.stats.attending * 0.1)} kg</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
                          <span className="text-muted-foreground">Dal/Curry</span>
                          <span className="font-medium">{Math.ceil(slot.stats.attending * 0.08)} kg</span>
                        </div>
                      </div>
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

export default MessDemand;
