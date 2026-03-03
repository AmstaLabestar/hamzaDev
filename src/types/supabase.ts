export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Enums: {
      publish_status: 'draft' | 'published';
      project_type: 'web' | 'mobile' | 'desktop' | 'api' | 'other';
      skill_category: 'frontend' | 'backend' | 'devops' | 'database' | 'cloud' | 'mobile' | 'tooling' | 'other';
      log_action:
        | 'create'
        | 'update'
        | 'soft_delete'
        | 'restore'
        | 'login'
        | 'logout'
        | 'password_change'
        | 'session_revoke';
    };
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          email: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          email: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          email?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          description: string;
          technologies: string[];
          project_type: Database['public']['Enums']['project_type'];
          github_url: string | null;
          demo_url: string | null;
          demo_video_path: string | null;
          image_path: string | null;
          project_date: string;
          status: Database['public']['Enums']['publish_status'];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          search_document: unknown;
        };
        Insert: {
          id?: string;
          created_by?: string;
          title: string;
          description: string;
          technologies?: string[];
          project_type?: Database['public']['Enums']['project_type'];
          github_url?: string | null;
          demo_url?: string | null;
          demo_video_path?: string | null;
          image_path?: string | null;
          project_date: string;
          status?: Database['public']['Enums']['publish_status'];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          description?: string;
          technologies?: string[];
          project_type?: Database['public']['Enums']['project_type'];
          github_url?: string | null;
          demo_url?: string | null;
          demo_video_path?: string | null;
          image_path?: string | null;
          project_date?: string;
          status?: Database['public']['Enums']['publish_status'];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          search_document?: unknown;
        };
      };
      experiences: {
        Row: {
          id: string;
          created_by: string;
          position: string;
          company: string;
          location: string;
          start_date: string;
          end_date: string | null;
          is_current: boolean;
          description: string;
          status: Database['public']['Enums']['publish_status'];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          search_document: unknown;
        };
        Insert: {
          id?: string;
          created_by?: string;
          position: string;
          company: string;
          location: string;
          start_date: string;
          end_date?: string | null;
          is_current?: boolean;
          description: string;
          status?: Database['public']['Enums']['publish_status'];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_by?: string;
          position?: string;
          company?: string;
          location?: string;
          start_date?: string;
          end_date?: string | null;
          is_current?: boolean;
          description?: string;
          status?: Database['public']['Enums']['publish_status'];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          search_document?: unknown;
        };
      };
      skills: {
        Row: {
          id: string;
          created_by: string;
          name: string;
          category: Database['public']['Enums']['skill_category'];
          level: number;
          icon: string;
          sort_order: number;
          status: Database['public']['Enums']['publish_status'];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_by?: string;
          name: string;
          category: Database['public']['Enums']['skill_category'];
          level: number;
          icon: string;
          sort_order?: number;
          status?: Database['public']['Enums']['publish_status'];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_by?: string;
          name?: string;
          category?: Database['public']['Enums']['skill_category'];
          level?: number;
          icon?: string;
          sort_order?: number;
          status?: Database['public']['Enums']['publish_status'];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      profile: {
        Row: {
          id: string;
          owner_id: string;
          full_name: string;
          professional_title: string;
          bio: string;
          email: string;
          linkedin_url: string | null;
          github_url: string | null;
          avatar_path: string | null;
          status: Database['public']['Enums']['publish_status'];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id?: string;
          full_name: string;
          professional_title: string;
          bio: string;
          email: string;
          linkedin_url?: string | null;
          github_url?: string | null;
          avatar_path?: string | null;
          status?: Database['public']['Enums']['publish_status'];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          full_name?: string;
          professional_title?: string;
          bio?: string;
          email?: string;
          linkedin_url?: string | null;
          github_url?: string | null;
          avatar_path?: string | null;
          status?: Database['public']['Enums']['publish_status'];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          created_by: string;
          file_name: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          sha256: string;
          version: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_by?: string;
          file_name: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          sha256: string;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_by?: string;
          file_name?: string;
          storage_path?: string;
          mime_type?: string;
          size_bytes?: number;
          sha256?: string;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      admin_logs: {
        Row: {
          id: number;
          actor_id: string | null;
          action: Database['public']['Enums']['log_action'];
          entity_table: string;
          entity_id: string | null;
          before_data: Json | null;
          after_data: Json | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          actor_id?: string | null;
          action: Database['public']['Enums']['log_action'];
          entity_table: string;
          entity_id?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: never;
          actor_id?: string | null;
          action?: Database['public']['Enums']['log_action'];
          entity_table?: string;
          entity_id?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
  };
}
