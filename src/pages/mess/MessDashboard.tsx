import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mealStats, todayMenu } from '@/data/mockData';
import {
  ChefHat,
  Users,
  TrendingDown,
  Coffee,
  Sun,
  Moon,
  UtensilsCrossed,
} from 'lucide-react';
import { format } from 'date-fns';

const MessDashboard: React.FC = () => {
  const mealIcons = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
  };

  const mealData = [
    { key: 'breakfast', ...mealStats.today.breakfast },
    { key: 'lunch', ...mealStats.today.lunch },
    { key: 'dinner', ...mealStats.today.dinner },
  ] as const;

  const totalMeals = mealData.reduce((acc, m) => acc + m.attending, 0);
  const totalOptOuts = mealData.reduce((acc, m) => acc + m.optOut, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Mess Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} - Meal planning overview
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Meals</p>
                  <p className="font-display text-3xl font-bold">{totalMeals}</p>
                </div>
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Opt-Outs</p>
                  <p className="font-display text-3xl font-bold text-accent">{totalOptOuts}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Registered Students</p>
                  <p className="font-display text-3xl font-bold">{mealStats.today.breakfast.total}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meal Demand Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mealData.map((meal) => {
            const Icon = mealIcons[meal.key];
            const attendanceRate = Math.round((meal.attending / meal.total) * 100);

            return (
              <Card key={meal.key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <Icon className="h-5 w-5 text-primary" />
                      {meal.key}
                    </CardTitle>
                    <Badge variant="outline">{attendanceRate}% attending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected</span>
                    <span className="font-medium text-success">{meal.attending}</span>
                  </div>
                  <Progress value={attendanceRate} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 rounded-lg bg-success/10">
                      <p className="text-2xl font-bold text-success">{meal.attending}</p>
                      <p className="text-xs text-muted-foreground">Attending</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent/10">
                      <p className="text-2xl font-bold text-accent">{meal.optOut}</p>
                      <p className="text-xs text-muted-foreground">Opt-out</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Today's Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              Today's Menu
            </CardTitle>
            <CardDescription>
              Planned meals for {format(new Date(), 'MMMM d')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {todayMenu.map((menu) => {
                const Icon = mealIcons[menu.meal];
                return (
                  <div key={menu.meal} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h4 className="font-medium capitalize">{menu.meal}</h4>
                    </div>
                    <ul className="space-y-2">
                      {menu.items.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MessDashboard;