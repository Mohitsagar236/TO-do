import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Button } from './ui/Button';
import { useTaskStore } from '../store/taskStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });

  const selectedTask = useTaskStore((state) => state.selectedTask);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    const newSessionCount = sessionCount + 1;
    setSessionCount(newSessionCount);

    if (isBreak) {
      // Switch to work session
      setTimeLeft(settings.workDuration * 60);
      setIsBreak(false);
      toast.success('Break complete! Time to work!');
    } else {
      // Record completed work session
      if (selectedTask) {
        try {
          await supabase.from('time_entries').insert({
            task_id: selectedTask.id,
            start_time: new Date(Date.now() - settings.workDuration * 60000),
            end_time: new Date(),
            duration: `${settings.workDuration} minutes`,
            type: 'pomodoro',
          });
        } catch (error) {
          console.error('Failed to save time entry:', error);
        }
      }

      // Switch to break
      const isLongBreak = newSessionCount % settings.sessionsUntilLongBreak === 0;
      const breakDuration = isLongBreak ? settings.longBreakDuration : settings.breakDuration;
      setTimeLeft(breakDuration * 60);
      setIsBreak(true);
      toast.success(isLongBreak ? 'Time for a long break!' : 'Time for a short break!');
    }

    setIsRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setTimeLeft(settings.workDuration * 60);
    setIsRunning(false);
    setIsBreak(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </h2>
        <div className="text-4xl font-mono mb-6 dark:text-white">{formatTime(timeLeft)}</div>
        <div className="space-x-4">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? 'outline' : 'primary'}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw size={20} />
          </Button>
          <Button variant="outline">
            <Settings size={20} />
          </Button>
        </div>
      </div>
      {selectedTask && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Current Task: {selectedTask.title}
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        Session {sessionCount + 1} of {settings.sessionsUntilLongBreak}
      </div>
    </div>
  );
}