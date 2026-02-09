export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InputModality = "text" | "image" | "file" | "audio" | "video";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          prompt_text: string;
          categories: string[];
          ai_platforms: string[];
          input_modality: InputModality;
          is_public: boolean;
          view_count: number;
          copy_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          prompt_text: string;
          categories: string[];
          ai_platforms: string[];
          input_modality?: InputModality;
          is_public?: boolean;
          view_count?: number;
          copy_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          prompt_text?: string;
          categories?: string[];
          ai_platforms?: string[];
          input_modality?: InputModality;
          is_public?: boolean;
          view_count?: number;
          copy_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_id?: string;
          score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ratings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ratings_prompt_id_fkey";
            columns: ["prompt_id"];
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_prompts: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_prompts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_prompts_prompt_id_fkey";
            columns: ["prompt_id"];
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      prompt_ratings: {
        Row: {
          prompt_id: string;
          rating_count: number;
          average_rating: number;
        };
        Relationships: [
          {
            foreignKeyName: "ratings_prompt_id_fkey";
            columns: ["prompt_id"];
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          }
        ];
      };
      prompt_save_counts: {
        Row: {
          prompt_id: string;
          save_count: number;
        };
        Relationships: [
          {
            foreignKeyName: "saved_prompts_prompt_id_fkey";
            columns: ["prompt_id"];
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      increment_view_count: {
        Args: { prompt_id: string };
        Returns: void;
      };
      increment_copy_count: {
        Args: { prompt_id: string };
        Returns: void;
      };
    };
    Enums: {
      input_modality: InputModality;
    };
  };
}

// Helper types for easier usage
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Prompt = Database["public"]["Tables"]["prompts"]["Row"];
export type PromptInsert = Database["public"]["Tables"]["prompts"]["Insert"];
export type PromptUpdate = Database["public"]["Tables"]["prompts"]["Update"];

export type Rating = Database["public"]["Tables"]["ratings"]["Row"];
export type RatingInsert = Database["public"]["Tables"]["ratings"]["Insert"];
export type RatingUpdate = Database["public"]["Tables"]["ratings"]["Update"];

export type SavedPrompt = Database["public"]["Tables"]["saved_prompts"]["Row"];
export type SavedPromptInsert = Database["public"]["Tables"]["saved_prompts"]["Insert"];

export type PromptRating = Database["public"]["Views"]["prompt_ratings"]["Row"];
export type PromptSaveCount = Database["public"]["Views"]["prompt_save_counts"]["Row"];

// Extended prompt type with user and ratings
export interface PromptWithDetails extends Prompt {
  profiles: Pick<Profile, "username" | "avatar_url">;
  prompt_ratings: PromptRating | null;
  save_count?: number;
}
