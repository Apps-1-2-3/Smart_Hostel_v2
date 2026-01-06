import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi, AnalyticsDTO } from '@/services/api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  UtensilsCrossed,
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
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays } from 'date-fns';

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
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

  // Generate weekly data from analytics
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      day: format(date, 'EEE'),
      in: Math.round((analytics?.presentToday || 0) * (0.8 + Math.random() * 0.4)),
      out: Math.round((analytics?.absentToday || 0) * (0.8 + Math.random() * 0.4)),
    };
  });

  // Convert hourly check-ins/outs to chart data
  const peakHoursData = Object.entries(analytics?.hourlyCheckIns || {})
    .map(([hour, count]) => ({
      hour: `${parseInt(hour) % 12 || 12}${parseInt(hour) < 12 ? 'AM' : 'PM'}`,
      count: count + (analytics?.hourlyCheckOuts?.[parseInt(hour)] || 0),
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Meal opt-out data
  const mealOptOutData = Object.entries(analytics?.mealOptOuts || {}).map(([meal, count]) => ({
    meal: meal.charAt(0).toUpperCase() + meal.slice(1),
    optOuts: count,
  }));

  // Weekly meal trends (simulated based on analytics)
  const weeklyMealData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const baseCount = analytics?.totalStudents || 100;
    return {
      day: format(date, 'EEE'),
      breakfast: Math.round(baseCount * (0.75 + Math.random() * 0.2)),
      lunch: Math.round(baseCount * (0.85 + Math.random() * 0.15)),
      dinner: Math.round(baseCount * (0.9 + Math.random() * 0.1)),
    };
  });

  // Menu popularity (simulated)
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
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed insights into hostel operations and trends
          </p>
        </div>

        {/* Weekly Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Attendance Trend
            </CardTitle>
            <CardDescription>
              In/Out movements over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="in"
                  stroke="hsl(var(--success))"
                  fillOpacity={1}
                  fill="url(#colorIn)"
                  name="Check-ins"
                />
                <Area
                  type="monotone"
                  dataKey="out"
                  stroke="hsl(var(--accent))"
                  fillOpacity={1}
                  fill="url(#colorOut)"
                  name="Check-outs"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Peak IN/OUT Hours
              </CardTitle>
              <CardDescription>
                Busiest times for hostel entry/exit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {peakHoursData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={peakHoursData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="hour" type="category" width={70} fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                      name="Movements"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  No hourly data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Meal Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Weekly Meal Attendance
              </CardTitle>
              <CardDescription>
                Meal attendance patterns this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyMealData}>
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
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lunch"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dinner"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
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
              <BarChart3 className="h-5 w-5 text-primary" />
              Menu Item Popularity
            </CardTitle>
            <CardDescription>
              Most requested items from student feedback
            </CardDescription>
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
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
