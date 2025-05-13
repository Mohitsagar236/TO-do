import { create } from 'zustand';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Task } from '../types';
import { useTaskStore } from './taskStore';
import { supabase } from '../lib/supabase';

interface ExportStore {
  exportToPDF: (tasks: Task[]) => Promise<void>;
  exportToExcel: (tasks: Task[]) => Promise<void>;
  updateExportStatus: (taskId: string, format: string) => Promise<void>;
}

export const useExportStore = create<ExportStore>((set) => ({
  exportToPDF: async (tasks: Task[]) => {
    const doc = new jsPDF();
    let yPos = 20;

    // Add title
    doc.setFontSize(20);
    doc.text('Task Report', 20, yPos);
    yPos += 20;

    // Add tasks
    doc.setFontSize(12);
    tasks.forEach((task) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(task.title, 20, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      if (task.description) {
        doc.text(task.description, 20, yPos);
        yPos += 7;
      }

      const status = `Status: ${task.completed ? 'Completed' : 'Pending'}`;
      doc.text(status, 20, yPos);
      yPos += 7;

      if (task.dueDate) {
        const dueDate = `Due: ${new Date(task.dueDate).toLocaleDateString()}`;
        doc.text(dueDate, 20, yPos);
        yPos += 7;
      }

      yPos += 5; // Add space between tasks
    });

    // Save the PDF
    doc.save('tasks.pdf');

    // Update export status for all exported tasks
    await Promise.all(
      tasks.map((task) => useExportStore.getState().updateExportStatus(task.id, 'pdf'))
    );
  },

  exportToExcel: async (tasks: Task[]) => {
    const workbook = XLSX.utils.book_new();
    
    const data = tasks.map((task) => ({
      Title: task.title,
      Description: task.description || '',
      Status: task.completed ? 'Completed' : 'Pending',
      Priority: task.priority,
      Category: task.category,
      'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
      'Created At': new Date(task.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

    // Save the Excel file
    XLSX.writeFile(workbook, 'tasks.xlsx');

    // Update export status for all exported tasks
    await Promise.all(
      tasks.map((task) => useExportStore.getState().updateExportStatus(task.id, 'excel'))
    );
  },

  updateExportStatus: async (taskId: string, format: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        export_format: format,
        last_exported_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) throw error;

    // Update local state
    const updateTask = useTaskStore.getState().updateTask;
    await updateTask(taskId, {
      export_format: format,
      last_exported_at: new Date(),
    });
  },
}));