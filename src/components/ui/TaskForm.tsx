import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { useTaskStore } from '../../store/taskStore';
import { Priority } from '../../types';
import { Wand2, Mic, MicOff, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import { encryptData, hashPassword, generateEncryptionKey } from '../../lib/encryption';

export function TaskForm() {
  const addTask = useTaskStore((state) => state.addTask);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('personal');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // New state for encryption
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    if (isEncrypted && (!password || password !== confirmPassword)) {
      toast.error('Please enter matching passwords');
      return;
    }

    setIsSubmitting(true);
    try {
      let taskData = {
        title,
        description,
        priority,
        category,
        completed: false,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      };

      if (isEncrypted) {
        const encryptionKey = generateEncryptionKey();
        const encryptedData = encryptData(taskData, encryptionKey);
        taskData = {
          ...taskData,
          isEncrypted: true,
          encryptionKey,
          passwordHash: hashPassword(password),
          title: '🔒 ' + title, // Visual indicator for encrypted tasks
        };
      }

      await addTask(taskData);

      toast.success('Task added successfully!');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('personal');
      setDueDate('');
      setPassword('');
      setConfirmPassword('');
      setIsEncrypted(false);
    } catch (error) {
      toast.error('Failed to add task');
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const analyzePriority = async () => {
    if (!title && !description) {
      toast.error('Please enter task details first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      setPriority(data.priority);
      if (data.suggestedDueDate) {
        setDueDate(data.suggestedDueDate);
      }
      if (data.suggestedCategory) {
        setCategory(data.suggestedCategory);
      }

      toast.success('Task analyzed and suggestions applied');
    } catch (error) {
      toast.error('Failed to analyze task');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Failed to recognize speech');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceCommand = (transcript: string) => {
    const text = transcript.toLowerCase();
    
    // Extract task title
    let taskTitle = text;
    if (text.startsWith('remind me to ')) {
      taskTitle = text.replace('remind me to ', '');
    }
    
    // Extract date and time
    const tomorrow = /tomorrow/i.test(text);
    const today = /today/i.test(text);
    const timeMatch = text.match(/at (\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
    
    let taskDate = new Date();
    if (tomorrow) {
      taskDate.setDate(taskDate.getDate() + 1);
    }
    
    if (timeMatch) {
      const timeStr = timeMatch[1];
      const [hours, minutes = '00'] = timeStr.split(':');
      const isPM = /pm/i.test(timeStr);
      
      let hour = parseInt(hours);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      
      taskDate.setHours(hour, parseInt(minutes));
    }
    
    // Extract priority keywords
    const highPriorityKeywords = ['urgent', 'important', 'asap', 'critical'];
    const newPriority = highPriorityKeywords.some(keyword => text.includes(keyword)) ? 'high' : 'medium';
    
    // Update form state
    setTitle(taskTitle);
    setPriority(newPriority);
    if (tomorrow || today || timeMatch) {
      setDueDate(taskDate.toISOString().split('T')[0]);
    }
    
    toast.success('Voice command processed');
  };

  const generateTasksFromNotes = async () => {
    if (!notes.trim()) {
      toast.error('Please enter some notes to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      const tasks = await response.json();
      for (const task of tasks) {
        await addTask(task);
      }

      setNotes('');
      toast.success(`${tasks.length} tasks extracted from notes`);
    } catch (error) {
      toast.error('Failed to extract tasks from notes');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter task title"
          />
          <Button
            type="button"
            onClick={analyzePriority}
            disabled={isAnalyzing}
            variant="outline"
            className="flex-shrink-0"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Analyze
          </Button>
          <Button
            type="button"
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? 'primary' : 'outline'}
            className="flex-shrink-0"
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="button"
            onClick={() => setIsEncrypted(!isEncrypted)}
            variant={isEncrypted ? 'primary' : 'outline'}
            className="flex-shrink-0"
          >
            {isEncrypted ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {isEncrypted && (
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter password to encrypt task"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Confirm password"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="shopping">Shopping</option>
            <option value="health">Health</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Generate Tasks from Notes
        </label>
        <div className="mt-1 space-y-2">
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Paste your notes here to automatically extract tasks..."
          />
          <Button
            type="button"
            onClick={generateTasksFromNotes}
            disabled={isAnalyzing || !notes.trim()}
            variant="secondary"
            className="w-full"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Extract Tasks from Notes
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Adding Task...' : 'Add Task'}
      </Button>
    </form>
  );
}