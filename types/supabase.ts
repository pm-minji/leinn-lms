export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'learner' | 'coach' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'learner' | 'coach' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'learner' | 'coach' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coaches: {
        Row: {
          id: string;
          user_id: string;
          specialty: string[] | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          specialty?: string[] | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          specialty?: string[] | null;
          active?: boolean;
          created_at?: string;
        };
      };
      learners: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          joined_at: string;
          active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id?: string | null;
          joined_at?: string;
          active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string | null;
          joined_at?: string;
          active?: boolean;
        };
      };
      coach_teams: {
        Row: {
          id: string;
          coach_id: string;
          team_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          team_id: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          team_id?: string;
          assigned_at?: string;
        };
      };
      reflections: {
        Row: {
          id: string;
          learner_id: string;
          team_id: string | null;
          title: string;
          content: string;
          week_start: string;
          status: 'submitted' | 'ai_feedback_done' | 'ai_feedback_pending' | 'coach_feedback_done';
          ai_summary: string | null;
          ai_risks: string | null;
          ai_actions: string | null;
          coach_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          learner_id: string;
          team_id?: string | null;
          title: string;
          content: string;
          week_start: string;
          status?: 'submitted' | 'ai_feedback_done' | 'ai_feedback_pending' | 'coach_feedback_done';
          ai_summary?: string | null;
          ai_risks?: string | null;
          ai_actions?: string | null;
          coach_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          learner_id?: string;
          team_id?: string | null;
          title?: string;
          content?: string;
          week_start?: string;
          status?: 'submitted' | 'ai_feedback_done' | 'ai_feedback_pending' | 'coach_feedback_done';
          ai_summary?: string | null;
          ai_risks?: string | null;
          ai_actions?: string | null;
          coach_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      coaching_logs: {
        Row: {
          id: string;
          coach_id: string;
          learner_id: string | null;
          team_id: string | null;
          title: string;
          session_date: string;
          session_type: '1:1' | 'team' | 'weekly';
          notes: string | null;
          next_actions: string | null;
          follow_up_date: string | null;
          status: 'open' | 'done';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          learner_id?: string | null;
          team_id?: string | null;
          title: string;
          session_date: string;
          session_type: '1:1' | 'team' | 'weekly';
          notes?: string | null;
          next_actions?: string | null;
          follow_up_date?: string | null;
          status?: 'open' | 'done';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          learner_id?: string | null;
          team_id?: string | null;
          title?: string;
          session_date?: string;
          session_type?: '1:1' | 'team' | 'weekly';
          notes?: string | null;
          next_actions?: string | null;
          follow_up_date?: string | null;
          status?: 'open' | 'done';
          created_at?: string;
          updated_at?: string;
        };
      };
      okrs: {
        Row: {
          id: string;
          team_id: string;
          objective: string;
          key_results: Json;
          progress: number;
          confidence: number | null;
          status: 'on_track' | 'at_risk' | 'off_track' | null;
          cycle: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          objective: string;
          key_results: Json;
          progress?: number;
          confidence?: number | null;
          status?: 'on_track' | 'at_risk' | 'off_track' | null;
          cycle: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          objective?: string;
          key_results?: Json;
          progress?: number;
          confidence?: number | null;
          status?: 'on_track' | 'at_risk' | 'off_track' | null;
          cycle?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      peer_reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewee_id: string;
          team_id: string;
          period: string;
          collab_score: number | null;
          exec_score: number | null;
          lead_score: number | null;
          comment: string | null;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          reviewee_id: string;
          team_id: string;
          period: string;
          collab_score?: number | null;
          exec_score?: number | null;
          lead_score?: number | null;
          comment?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          team_id?: string;
          period?: string;
          collab_score?: number | null;
          exec_score?: number | null;
          lead_score?: number | null;
          comment?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
        };
      };
      ai_prompt_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          prompt_text: string;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          prompt_text: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          prompt_text?: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
