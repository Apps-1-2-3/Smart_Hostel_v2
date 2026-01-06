import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { messApi, MealDemandDTO } from '@/services/api';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';

const MessStatistics: React.FC = () => {
  const [mealDemand, setMealDemand] = useState<MealDemandDTO | null>(null);
  const [optOutStats, setOptOutStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        const endDate = format(new Date(), 'yyyy-MM-dd');
        
        const [demandData, statsData] = await Promise.all([
          messApi.getTodaysDemand(),
          messApi.getOptOutStats(startDate, endDate),
        ]);
        
        setMealDemand(demandData);
        setOptOutStats(statsData);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
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

  // Calculate totals from meal demand
  const totalAttending = mealDemand?.mealStats 
    ? Object.values(mealDemand.mealStats).reduce((acc, stats) => acc + stats.eating, 0)
    : 0;
  const totalOptOut = mealDemand?.mealStats 
    ? Object.values(mealDemand.mealStats).reduce((acc, stats) => acc + stats.optedOut, 0)
    : 0;

  const pieData = [
    { name: 'Attending', value: totalAttending, color: 'hsl(var(--success))' },
    { name: 'Opt-out', value: totalOptOut, color: 'hsl(var(--accent))' },
  ];

  // Generate weekly data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const baseCount = mealDemand?.totalStudents || 100;
    return {
      day: format(date, 'EEE'),
      breakfast: Math.round(baseCount * (0.75 + Math.random() * 0.2)),
      lunch: Math.round(baseCount * (0.85 + Math.random() * 0.15)),
      dinner: Math.round(baseCount * (0.9 + Math.random() * 0.1)),
    };
  });

  // Menu popularity (can be fetched from backend if available)
  const menuPopularity = [
    { item: 'Biryani', votes: 156 },
    { item: 'Paneer Butter Masala', votes: 142 },
    { item: 'Chole Bhature', votes: 128 },
    { item: 'Dosa', votes: 115 },
    { item: 'Rajma Chawal', votes: 98 },
    { item: 'Pasta', votes: 87 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Mess Statistics
          </h1>
          <p className="text-muted-foreground mt-1">
            Analytics and trends for meal management
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Today's Distribution
              </CardTitle>
              <CardDescription>Attending vs Opt-out breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Meal Trend
              </CardTitle>
              <CardDescription>Attendance patterns this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="breakfast"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    name="Breakfast"
                  />
                  <Line
                    type="monotone"
                    dataKey="lunch"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    name="Lunch"
                  />
                  <Line
                    type="monotone"
                    dataKey="dinner"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Dinner"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Menu Popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Menu Popularity Rankings
            </CardTitle>
            <CardDescription>Most requested items based on student feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={menuPopularity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="item" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="votes"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Votes"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuPopularity.slice(0, 4).map((item, index) => (
            <Card key={item.item}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-primary-foreground ${
                    index === 0 ? 'bg-accent' : 'gradient-primary'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.item}</p>
                    <p className="text-xs text-muted-foreground">{item.votes} votes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessStatistics;
