import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/components/instructions/ExerciseContent';

export interface DatabaseExercise {
  id: string;
  title: string;
  description: string | null;
  exercise_type: string;
  pdf_url: string | null;
  file_name: string | null;
  drive_link: string | null;
  custom_title: string | null;
  border_color: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ExerciseContentEdit {
  id: string;
  exercise_id: string;
  edit_data: any;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface InstructionContentEdit {
  id: string;
  component_id: string;
  edit_data: any;
  created_at: string;
  updated_at: string;
  created_by: string;
}

class ExerciseService {
  // Convert database exercise to Exercise type
  private dbToExercise(dbExercise: DatabaseExercise): Exercise {
    return {
      id: dbExercise.id,
      title: dbExercise.title,
      description: dbExercise.description || '',
      borderColor: dbExercise.border_color,
      exerciseType: dbExercise.exercise_type as 'basic' | 'pdf' | 'drive-link',
      pdfUrl: dbExercise.pdf_url || undefined,
      fileName: dbExercise.file_name || undefined,
      driveLink: dbExercise.drive_link || undefined,
      customTitle: dbExercise.custom_title || undefined,
    };
  }

  // Convert Exercise to database format
  private exerciseToDb(exercise: Exercise, userId?: string): Omit<DatabaseExercise, 'created_at' | 'updated_at'> {
    return {
      id: exercise.id,
      title: exercise.title,
      description: exercise.description || null,
      exercise_type: exercise.exerciseType || 'basic',
      pdf_url: exercise.pdfUrl || null,
      file_name: exercise.fileName || null,
      drive_link: exercise.driveLink || null,
      custom_title: exercise.customTitle || null,
      border_color: exercise.borderColor || '#3B82F6',
      display_order: 0,
      created_by: userId || null,
      updated_by: userId || null,
    };
  }

  // Fetch all exercises from database
  async fetchExercises(): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching exercises:', error);
        throw error;
      }

      return data ? data.map(this.dbToExercise) : [];
    } catch (error) {
      console.error('Error in fetchExercises:', error);
      throw error;
    }
  }

  // Save exercise to database
  async saveExercise(exercise: Exercise): Promise<Exercise> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const dbExercise = this.exerciseToDb(exercise, userId);

      const { data, error } = await supabase
        .from('exercises')
        .upsert({
          ...dbExercise,
          updated_by: userId || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving exercise:', error);
        throw error;
      }

      return this.dbToExercise(data);
    } catch (error) {
      console.error('Error in saveExercise:', error);
      throw error;
    }
  }

  // Delete exercise from database
  async deleteExercise(exerciseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) {
        console.error('Error deleting exercise:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteExercise:', error);
      throw error;
    }
  }

  // Update exercise order
  async updateExerciseOrder(exercises: Exercise[]): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // Use individual UPDATE queries to only change display_order
      const updates = exercises.map((exercise, index) => 
        supabase
          .from('exercises')
          .update({ 
            display_order: index,
            updated_by: userId 
          })
          .eq('id', exercise.id)
      );

      const results = await Promise.all(updates);
      
      // Check for errors
      for (const result of results) {
        if (result.error) {
          console.error('Error updating exercise order:', result.error);
          throw result.error;
        }
      }
    } catch (error) {
      console.error('Error in updateExerciseOrder:', error);
      throw error;
    }
  }

  // Initialize default exercises if database is empty
  async initializeDefaultExercises(defaultExercises: Exercise[]): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const dbExercises = defaultExercises.map((exercise, index) => ({
        id: exercise.id,
        title: exercise.title,
        description: exercise.description || null,
        exercise_type: exercise.exerciseType || 'basic',
        pdf_url: exercise.pdfUrl || null,
        file_name: exercise.fileName || null,
        drive_link: exercise.driveLink || null,
        custom_title: exercise.customTitle || null,
        border_color: exercise.borderColor || '#3B82F6',
        display_order: index,
        created_by: userId,
        updated_by: userId,
      }));

      const { error } = await supabase
        .from('exercises')
        .insert(dbExercises);

      if (error) {
        console.error('Error initializing default exercises:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in initializeDefaultExercises:', error);
      throw error;
    }
  }

  // Fetch exercise content edits
  async fetchExerciseContentEdits(): Promise<{[key: string]: any}> {
    try {
      const { data, error } = await supabase
        .from('exercise_content_edits')
        .select('*');

      if (error) {
        console.error('Error fetching exercise content edits:', error);
        return {};
      }

      const edits: {[key: string]: any} = {};
      data?.forEach((edit) => {
        edits[edit.exercise_id] = edit.edit_data;
      });

      return edits;
    } catch (error) {
      console.error('Error in fetchExerciseContentEdits:', error);
      return {};
    }
  }

  // Save exercise content edit
  async saveExerciseContentEdit(exerciseId: string, editData: any): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('exercise_content_edits')
        .upsert({
          exercise_id: exerciseId,
          edit_data: editData,
          created_by: userId,
        });

      if (error) {
        console.error('Error saving exercise content edit:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveExerciseContentEdit:', error);
      throw error;
    }
  }

  // Fetch instruction content edits
  async fetchInstructionContentEdits(): Promise<{[key: string]: any}> {
    try {
      const { data, error } = await supabase
        .from('instruction_content_edits')
        .select('*');

      if (error) {
        console.error('Error fetching instruction content edits:', error);
        return {};
      }

      const edits: {[key: string]: any} = {};
      data?.forEach((edit) => {
        edits[edit.component_id] = edit.edit_data;
      });

      return edits;
    } catch (error) {
      console.error('Error in fetchInstructionContentEdits:', error);
      return {};
    }
  }

  // Save instruction content edit
  async saveInstructionContentEdit(componentId: string, editData: any): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('instruction_content_edits')
        .upsert({
          component_id: componentId,
          edit_data: editData,
          created_by: userId,
        });

      if (error) {
        console.error('Error saving instruction content edit:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveInstructionContentEdit:', error);
      throw error;
    }
  }

}

export const exerciseService = new ExerciseService();
