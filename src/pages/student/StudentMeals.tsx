import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, CalendarIcon, Coffee, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isBefore, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface MealSelection {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

interface OptOutRecord {
  date: Date;
  meals: ('breakfast' | 'lunch' | 'dinner')[];
}

const StudentMeals: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [mealSelection, setMealSelection] = useState<MealSelection>({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [optOutHistory] = useState<OptOutRecord[]>([
    { date: addDays(new Date(), 1), meals: ['breakfast'] },
    { date: addDays(new Date(), 3), meals: ['lunch', 'dinner'] },
  ]);

  const handleMealToggle = (meal: keyof MealSelection) => {
    setMealSelection(prev => ({ ...prev, [meal]: !prev[meal] }));
  };

  const handleSubmitOptOut = () => {
    const selectedMeals = Object.entries(mealSelection)
      .filter(([_, selected]) => selected)
      .map(([meal]) => meal);

    if (selectedMeals.length === 0) {
      toast({
        title: 'No meals selected',
        description: 'Please select at least one meal to opt out.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Opt-out submitted',
      description: `You have opted out of ${selectedMeals.join(', ')} for ${format(selectedDate!, 'MMMM d')}.`,
    });

    setMealSelection({ breakfast: false, lunch: false, dinner: false });
  };

  const mealIcons = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
  };

  const mealTimes = {
    breakfast: '7:30 AM - 9:00 AM',
    lunch: '12:30 PM - 2:00 PM',
    dinner: '7:30 PM - 9:00 PM',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Meal Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Opt out of meals to help reduce food waste
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Opt-Out Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Submit Meal Opt-Out
                </CardTitle>
                <CardDescription>
                  Select the date and meals you won't be attending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
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
                        disabled={(date) => isBefore(date, startOfToday())}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Meal Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">Select Meals to Opt-Out</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(Object.keys(mealSelection) as Array<keyof MealSelection>).map((meal) => {
                      const Icon = mealIcons[meal];
                      const isSelected = mealSelection[meal];
                      return (
                        <div
                          key={meal}
                          onClick={() => handleMealToggle(meal)}
                          className={cn(
                            'relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200',
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleMealToggle(meal)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                                <span className="font-medium capitalize">{meal}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {mealTimes[meal]}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmitOptOut}
                  disabled={!selectedDate || !Object.values(mealSelection).some(Boolean)}
                >
                  Submit Opt-Out Request
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Opt-Out History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Opt-Outs</CardTitle>
                <CardDescription>Your scheduled meal opt-outs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optOutHistory.length > 0 ? (
                    optOutHistory.map((record, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-secondary/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {format(record.date, 'EEE, MMM d')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {record.meals.length} meal{record.meals.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {record.meals.map((meal) => (
                            <Badge key={meal} variant="secondary" className="text-xs capitalize">
                              {meal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      No upcoming opt-outs
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-4 bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Why Opt-Out?</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Reduces food waste in the hostel mess</li>
                  <li>• Helps mess staff plan better</li>
                  <li>• Contributes to sustainability goals</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentMeals;