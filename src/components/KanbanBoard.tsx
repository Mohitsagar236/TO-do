import React from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus } from '../types';
import { useTaskStore } from '../store/taskStore';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

export function KanbanBoard() {
  const { tasks, updateTask } = useTaskStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    updateTask(taskId, { status: newStatus });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((status) => (
          <SortableContext
            key={status}
            items={tasks.filter((task) => task.status === status).map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              status={status}
              tasks={tasks.filter((task) => task.status === status)}
            />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}