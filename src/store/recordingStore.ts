import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useTaskStore } from './taskStore';

interface RecordingStore {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  startRecording: (taskId: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  uploadRecording: (taskId: string, blob: Blob) => Promise<void>;
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  isRecording: false,
  mediaRecorder: null,

  startRecording: async (taskId: string) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await get().uploadRecording(taskId, blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      set({ mediaRecorder, isRecording: true });
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  },

  stopRecording: async () => {
    const { mediaRecorder } = get();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      set({ mediaRecorder: null, isRecording: false });
    }
  },

  uploadRecording: async (taskId: string, blob: Blob) => {
    try {
      // Generate a unique filename
      const filename = `recording-${taskId}-${Date.now()}.webm`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filename, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(filename);

      // Save recording metadata
      const { error: dbError } = await supabase
        .from('screen_recordings')
        .insert({
          task_id: taskId,
          url: publicUrl,
          duration: blob.size, // This is temporary, we should calculate actual duration
        });

      if (dbError) throw dbError;

      // Update task with recording URL
      const updateTask = useTaskStore.getState().updateTask;
      await updateTask(taskId, {
        recording_url: publicUrl,
      });
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  },
}));