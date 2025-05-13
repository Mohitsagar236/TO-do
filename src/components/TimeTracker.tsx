import React, { useState, useEffect } from 'react';
import { Play, Stop, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { useTaskStore } from '../store/taskStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function TimeTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const selectedTask = useTaskStore((state) => state.selectedTask);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking) {
      interval = setInterval(() => {
        if (startTime) {
          setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const handleStartTracking = () => {
    if (!selectedTask) {
      toast.error('Please select a task to track time');
      return;
    }

    setStartTime(new Date());
    setIsTracking(true);
    toast.success('Time tracking started');
  };

  const handleStopTracking = async () => {
    if (!startTime || !selectedTask) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    try {
      await supabase.from('time_entries').insert({
        task_id: selectedTask.id,
        start_time: startTime,
        end_time: endTime,
        duration: `${Math.floor(duration / 60)} minutes`,
        type: 'manual',
      });

      setIsTracking(false);
      setStartTime(null);
      setElapsedTime(0);
      toast.success('Time entry saved');
    } catch (error) {
      console.error('Failed to save time entry:', error);
      toast.error('Failed to save time entry');
    }
  };

  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Time Tracker</h2>
        <Clock className="text-gray-500 dark:text-gray-400" size={24} />
      </div>

      {selectedTask && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Tracking: {selectedTask.title}
        </div>
      )}

      <div className="text-3xl font-mono mb-4 text-center dark:text-white">
        {formatElapsedTime(elapsedTime)}
      </div>

      <div className="flex justify-center space-x-4">
        {!isTracking ? (
          <Button onClick={handleStartTracking} variant="primary">
            <Play size={20} className="mr-2" />
            Start
          </Button>
        ) : (
          <Button onClick={handleStopTracking} variant="outline" className="text-red-500">
            <Stop size={20} className="mr-2" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}