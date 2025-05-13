export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          completed: boolean
          due_date: string | null
          priority: 'low' | 'medium' | 'high'
          category: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          completed?: boolean
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high'
          category?: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          completed?: boolean
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high'
          category?: string
          created_at?: string
          user_id?: string
        }
      }
      task_shares: {
        Row: {
          id: string
          task_id: string
          user_id: string
          permission: 'view' | 'edit'
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          permission: 'view' | 'edit'
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          permission?: 'view' | 'edit'
          created_at?: string
        }
      }
      task_assignments: {
        Row: {
          id: string
          task_id: string
          assigned_to: string
          assigned_by: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          assigned_to: string
          assigned_by: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          assigned_to?: string
          assigned_by?: string
          created_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          mentions: string[]
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          mentions?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          mentions?: string[]
          created_at?: string
        }
      }
    }
  }
}