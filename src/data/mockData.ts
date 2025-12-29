// Mock data for the SmartHostel system

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  type: 'in' | 'out';
  timestamp: Date;
}

export interface MealOptOut {
  id: string;
  studentId: string;
  studentName: string;
  date: Date;
  meals: ('breakfast' | 'lunch' | 'dinner')[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  roomNumber: string;
  phone: string;
  department: string;
  year: number;
  currentStatus: 'in' | 'out';
}

export interface MenuItem {
  meal: 'breakfast' | 'lunch' | 'dinner';
  items: string[];
}

export const todayMenu: MenuItem[] = [
  {
    meal: 'breakfast',
    items: ['Idli Sambar', 'Dosa', 'Poha', 'Tea/Coffee', 'Fruits'],
  },
  {
    meal: 'lunch',
    items: ['Rice', 'Dal Fry', 'Mixed Vegetable', 'Roti', 'Curd', 'Salad'],
  },
  {
    meal: 'dinner',
    items: ['Jeera Rice', 'Paneer Butter Masala', 'Chapati', 'Sweet', 'Buttermilk'],
  },
];

export const mockStudents: Student[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@rvce.edu.in', roomNumber: 'A-204', phone: '9876543210', department: 'CSE', year: 3, currentStatus: 'in' },
  { id: '2', name: 'Priya Patel', email: 'priya@rvce.edu.in', roomNumber: 'B-105', phone: '9876543211', department: 'ECE', year: 2, currentStatus: 'out' },
  { id: '3', name: 'Amit Kumar', email: 'amit@rvce.edu.in', roomNumber: 'A-301', phone: '9876543212', department: 'ME', year: 4, currentStatus: 'in' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha@rvce.edu.in', roomNumber: 'C-202', phone: '9876543213', department: 'ISE', year: 3, currentStatus: 'in' },
  { id: '5', name: 'Vikram Singh', email: 'vikram@rvce.edu.in', roomNumber: 'B-401', phone: '9876543214', department: 'CSE', year: 2, currentStatus: 'out' },
  { id: '6', name: 'Ananya Rao', email: 'ananya@rvce.edu.in', roomNumber: 'A-102', phone: '9876543215', department: 'EEE', year: 3, currentStatus: 'in' },
  { id: '7', name: 'Karthik Nair', email: 'karthik@rvce.edu.in', roomNumber: 'C-305', phone: '9876543216', department: 'Civil', year: 4, currentStatus: 'in' },
  { id: '8', name: 'Meera Joshi', email: 'meera@rvce.edu.in', roomNumber: 'B-201', phone: '9876543217', department: 'CSE', year: 2, currentStatus: 'out' },
];

const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  mockStudents.forEach((student, index) => {
    // Morning entry
    const morningIn = new Date(today);
    morningIn.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
    records.push({
      id: `${student.id}-in-${today.toDateString()}`,
      studentId: student.id,
      studentName: student.name,
      roomNumber: student.roomNumber,
      type: 'in',
      timestamp: morningIn,
    });

    // Random out/in during day
    if (index % 2 === 0) {
      const dayOut = new Date(today);
      dayOut.setHours(9 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0);
      records.push({
        id: `${student.id}-out-${today.toDateString()}-1`,
        studentId: student.id,
        studentName: student.name,
        roomNumber: student.roomNumber,
        type: 'out',
        timestamp: dayOut,
      });

      const dayIn = new Date(today);
      dayIn.setHours(14 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0);
      records.push({
        id: `${student.id}-in-${today.toDateString()}-2`,
        studentId: student.id,
        studentName: student.name,
        roomNumber: student.roomNumber,
        type: 'in',
        timestamp: dayIn,
      });
    }
  });

  return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const mockAttendanceRecords = generateAttendanceRecords();

export const mockMealOptOuts: MealOptOut[] = [
  { id: '1', studentId: '1', studentName: 'Rahul Sharma', date: new Date(), meals: ['breakfast'] },
  { id: '2', studentId: '2', studentName: 'Priya Patel', date: new Date(), meals: ['lunch', 'dinner'] },
  { id: '3', studentId: '5', studentName: 'Vikram Singh', date: new Date(), meals: ['dinner'] },
];

export const attendanceStats = {
  weekly: [
    { day: 'Mon', in: 145, out: 32 },
    { day: 'Tue', in: 152, out: 28 },
    { day: 'Wed', in: 148, out: 35 },
    { day: 'Thu', in: 156, out: 25 },
    { day: 'Fri', in: 142, out: 45 },
    { day: 'Sat', in: 98, out: 72 },
    { day: 'Sun', in: 120, out: 58 },
  ],
  peakHours: [
    { hour: '6-8 AM', count: 45 },
    { hour: '8-10 AM', count: 78 },
    { hour: '10-12 PM', count: 35 },
    { hour: '12-2 PM', count: 42 },
    { hour: '2-4 PM', count: 28 },
    { hour: '4-6 PM', count: 65 },
    { hour: '6-8 PM', count: 82 },
    { hour: '8-10 PM', count: 55 },
  ],
};

export const mealStats = {
  today: {
    breakfast: { total: 180, optOut: 25, attending: 155 },
    lunch: { total: 180, optOut: 18, attending: 162 },
    dinner: { total: 180, optOut: 32, attending: 148 },
  },
  weekly: [
    { day: 'Mon', breakfast: 155, lunch: 165, dinner: 150 },
    { day: 'Tue', breakfast: 158, lunch: 162, dinner: 148 },
    { day: 'Wed', breakfast: 152, lunch: 168, dinner: 145 },
    { day: 'Thu', breakfast: 160, lunch: 158, dinner: 152 },
    { day: 'Fri', breakfast: 148, lunch: 155, dinner: 140 },
    { day: 'Sat', breakfast: 125, lunch: 145, dinner: 138 },
    { day: 'Sun', breakfast: 135, lunch: 152, dinner: 145 },
  ],
  menuPopularity: [
    { item: 'Paneer Butter Masala', votes: 145 },
    { item: 'Chicken Biryani', votes: 132 },
    { item: 'Masala Dosa', votes: 128 },
    { item: 'Chole Bhature', votes: 115 },
    { item: 'Pulao', votes: 98 },
  ],
};

export const roomAllocations = [
  { block: 'A', totalRooms: 50, occupied: 48, vacant: 2 },
  { block: 'B', totalRooms: 50, occupied: 45, vacant: 5 },
  { block: 'C', totalRooms: 40, occupied: 38, vacant: 2 },
];
