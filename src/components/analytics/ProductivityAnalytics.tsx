import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useTaskStore } from '../../store/taskStore';
import { useProgressStore } from '../../store/progressStore';
import { useHabitStore } from '../../store/habitStore';
import { Button } from '../ui/Button';
import {
  Calendar,
  Clock,
  Download,
  Filter,
  TrendingUp,
  Award,
  Target,
  Zap,
} from 'lucide-react';
import { format, startOfWeek, addDays, isWithinInterval, subDays } from 'date-fns';
import toast from 'react-hot-toast';

// Rest of the file remains the same