export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_content: {
        Row: {
          content: string
          content_type: string
          created_at: string | null
          created_by: string
          github_url: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string | null
          created_by: string
          github_url?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string | null
          created_by?: string
          github_url?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_initials: string | null
          author_name: string
          category: string
          content: string | null
          created_at: string | null
          created_by: string | null
          excerpt: string
          featured: boolean | null
          id: number
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_initials?: string | null
          author_name: string
          category: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt: string
          featured?: boolean | null
          id?: number
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_initials?: string | null
          author_name?: string
          category?: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string
          featured?: boolean | null
          id?: number
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          model_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          model_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          model_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_messages: {
        Row: {
          content: string
          id: string
          model_id: string
          role: string | null
          session_id: string | null
          side: string | null
          timestamp: string | null
        }
        Insert: {
          content: string
          id?: string
          model_id: string
          role?: string | null
          session_id?: string | null
          side?: string | null
          timestamp?: string | null
        }
        Update: {
          content?: string
          id?: string
          model_id?: string
          role?: string | null
          session_id?: string | null
          side?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparison_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      context_prompts: {
        Row: {
          content: string
          session_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          session_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "context_prompts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_content_edits: {
        Row: {
          created_at: string | null
          created_by: string
          edit_data: Json
          exercise_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          edit_data: Json
          exercise_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          edit_data?: Json
          exercise_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_content_edits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          border_color: string | null
          created_at: string | null
          created_by: string | null
          custom_title: string | null
          description: string | null
          display_order: number | null
          drive_link: string | null
          exercise_type: string | null
          file_name: string | null
          id: string
          pdf_url: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          border_color?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_title?: string | null
          description?: string | null
          display_order?: number | null
          drive_link?: string | null
          exercise_type?: string | null
          file_name?: string | null
          id: string
          pdf_url?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          border_color?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_title?: string | null
          description?: string | null
          display_order?: number | null
          drive_link?: string | null
          exercise_type?: string | null
          file_name?: string | null
          id?: string
          pdf_url?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          content_type: string
          created_at: string | null
          id: string
          message_id: string | null
          name: string
          size: number
          storage_path: string
          type: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          name: string
          size: number
          storage_path: string
          type: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          name?: string
          size?: number
          storage_path?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      instruction_content_edits: {
        Row: {
          component_id: string
          created_at: string | null
          created_by: string
          edit_data: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          component_id: string
          created_at?: string | null
          created_by: string
          edit_data: Json
          id?: string
          updated_at?: string | null
        }
        Update: {
          component_id?: string
          created_at?: string | null
          created_by?: string
          edit_data?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instruction_content_edits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          id: string
          role: string | null
          session_id: string | null
          timestamp: string | null
        }
        Insert: {
          content: string
          id?: string
          role?: string | null
          session_id?: string | null
          timestamp?: string | null
        }
        Update: {
          content?: string
          id?: string
          role?: string | null
          session_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_uploads: {
        Row: {
          file_size: number
          file_url: string
          filename: string
          id: string
          n8n_workflow_id: string | null
          processed_at: string | null
          processed_content: string | null
          processing_status: string | null
          session_id: string
          uploaded_at: string
        }
        Insert: {
          file_size: number
          file_url: string
          filename: string
          id?: string
          n8n_workflow_id?: string | null
          processed_at?: string | null
          processed_content?: string | null
          processing_status?: string | null
          session_id: string
          uploaded_at?: string
        }
        Update: {
          file_size?: number
          file_url?: string
          filename?: string
          id?: string
          n8n_workflow_id?: string | null
          processed_at?: string | null
          processed_content?: string | null
          processing_status?: string | null
          session_id?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
