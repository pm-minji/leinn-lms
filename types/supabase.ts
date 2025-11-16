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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'coaches_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: 'learners_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'learners_team_id_fkey';
            columns: ['team_id'];
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: 'coach_teams_coach_id_fkey';
            columns: ['coach_id'];
            referencedRelation: 'coaches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'coach_teams_team_id_fkey';
            columns: ['team_id'];
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: 'reflections_learner_id_fkey';
            columns: ['learner_id'];
            referencedRelation: 'learners';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reflections_team_id_fkey';
            columns: ['team_id'];
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: 'coaching_logs_coach_id_fkey';
            columns: ['coach_id'];
            referencedRelation: 'coaches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'coaching_logs_learner_id_fkey';
            columns: ['learner_id'];
            referencedRelation: 'learners';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'coaching_logs_team_id_fkey';
            columns: ['team_id'];
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: 'okrs_team_id_fkey';
            columns: ['team_id'];
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: 'peer_reviews_reviewer_id_fkey';
            columns: ['reviewer_id'];
            referencedRelation: 'learners';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'peer_reviews_reviewee_id_fkey';
            columns: ['reviewee_id'];
            referencedRelation: 'learners';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'peer_reviews_team_id_fkey';
            columns: ['team_id'];
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };
      ai_prompts: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          content: string;
          version: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          content: string;
          version?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          content?: string;
          version?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'ai_prompt_templates_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      exec_sql: {
        Args: { sql: string };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
