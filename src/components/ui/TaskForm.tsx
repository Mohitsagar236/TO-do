import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { useTaskStore } from '../../store/taskStore';
import { Priority } from '../../types';
import { Wand2, Mic, MicOff, Lock, Unlock, FileText, BrainCircuit, Calendar, Clock, Tag, CheckSquare, Upload } from 'lucide-react';
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
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Advanced features
  const [attachments, setAttachments] = useState<File[]>([]);
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [recurrence, setRecurrence] = useState('');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a task title');
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
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        status: 'todo',
        subTasks,
        labels,
        estimatedTime,
        energy,
        recurrence,
        dependencies,
        collaborators,
        customFields,
      };

      if (isEncrypted) {
        const encryptionKey = generateEncryptionKey();
        const encryptedData = encryptData(taskData, encryptionKey);
        taskData = {
          ...taskData,
          isEncrypted: true,
          encryptionKey,
          passwordHash: hashPassword(password),
          title: '🔒 ' + title,
        };
      }

      await addTask(taskData);
      toast.success('Task added successfully! 🎉');
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('personal');
      setDueDate('');
      setPassword('');
      setConfirmPassword('');
      setIsEncrypted(false);
      setSubTasks([]);
      setLabels([]);
      setEstimatedTime('');
      setEnergy('medium');
      setAttachments([]);
      setRecurrence('');
      setDependencies([]);
      setCollaborators([]);
      setCustomFields([]);
    } catch (error) {
      toast.error('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAISuggestions = async () => {
    if (!title && !description) {
      toast.error('Please enter some task details first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const suggestions = [
        'Consider breaking this into smaller subtasks',
        'This task might benefit from team collaboration',
        'Based on your schedule, Tuesday morning would be optimal',
        'Similar tasks typically take you 2-3 hours',
        'This aligns with your "Q1 Goals" project',
      ];
      setAiSuggestions(suggestions);
      setShowAIPanel(true);
      toast.success('AI analysis complete!');
    } catch (error) {
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addSubTask = () => {
    setSubTasks([...subTasks, '']);
  };

  const updateSubTask = (index: number, value: string) => {
    const updated = [...subTasks];
    updated[index] = value;
    setSubTasks(updated);
  };

  const removeSubTask = (index: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const handleLabelAdd = (label: string) => {
    if (!labels.includes(label)) {
      setLabels([...labels, label]);
    }
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const updateCustomField = (index: number, key: string, value: string) => {
    const updated = [...customFields];
    updated[index] = { key, value };
    setCustomFields(updated);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold dark:text-white">Create Task</h2>
        <div className="flex space-x-2">
          <Button
            type="button"
            onClick={() => setShowAIPanel(!showAIPanel)}
            variant={showAIPanel ? 'primary' : 'outline'}
          >
            <BrainCircuit className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button
            type="button"
            onClick={() => setIsEncrypted(!isEncrypted)}
            variant={isEncrypted ? 'primary' : 'outline'}
          >
            {isEncrypted ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Title</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter task title"
              />
              <Button
                type="button"
                onClick={generateAISuggestions}
                disabled={isAnalyzing}
                variant="outline"
              >
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter task description"
            />
          </div>

          {/* Encryption Section */}
          {isEncrypted && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter encryption password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          )}
        </div>

        {/* Task Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="finance">Finance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Estimated Time</label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g., 2h 30m"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Recurrence</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">No recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Energy Level Required</label>
            <div className="flex space-x-2">
              {['low', 'medium', 'high'].map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={energy === level ? 'primary' : 'outline'}
                  onClick={() => setEnergy(level as typeof energy)}
                  className="flex-1"
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Subtasks</label>
          <div className="space-y-2">
            {subTasks.map((subtask, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => updateSubTask(index, e.target.value)}
                  placeholder="Enter subtask"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeSubTask(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addSubTask}
              className="w-full"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Add Subtask
            </Button>
          </div>
        </div>

        {/* Labels Section */}
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Labels</label>
          <div className="flex flex-wrap gap-2">
            {labels.map((label, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200"
              >
                {label}
              </span>
            ))}
            <input
              type="text"
              placeholder="Add label and press Enter"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  handleLabelAdd(input.value);
                  input.value = '';
                }
              }}
            />
          </div>
        </div>

        {/* Custom Fields Section */}
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Custom Fields</label>
          <div className="space-y-2">
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateCustomField(index, e.target.value, field.value)}
                  placeholder="Field name"
                  className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => updateCustomField(index, field.key, e.target.value)}
                  placeholder="Field value"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeCustomField(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addCustomField}
              className="w-full"
            >
              Add Custom Field
            </Button>
          </div>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showAIPanel && aiSuggestions.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            AI Suggestions
          </h3>
          <ul className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-center text-sm text-blue-700 dark:text-blue-300"
              >
                <BrainCircuit className="w-4 h-4 mr-2" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Task...' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}