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
    }
  }
}