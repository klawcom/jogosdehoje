export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "17.1"
  }
  public: {
    Tables: {
      push_subscriptions: {
        Row: {
          id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          favorite_teams: string[];
          favorite_championships: string[];
          notify_pregame: boolean;
          notify_kickoff: boolean;
          notify_goals: boolean;
          notify_halftime: boolean;
          notify_end: boolean;
          notify_lineups: boolean;
          notify_table_change: boolean;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          favorite_teams?: string[];
          favorite_championships?: string[];
          notify_pregame?: boolean;
          notify_kickoff?: boolean;
          notify_goals?: boolean;
          notify_halftime?: boolean;
          notify_end?: boolean;
          notify_lineups?: boolean;
          notify_table_change?: boolean;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          favorite_teams?: string[];
          favorite_championships?: string[];
          notify_pregame?: boolean;
          notify_kickoff?: boolean;
          notify_goals?: boolean;
          notify_halftime?: boolean;
          notify_end?: boolean;
          notify_lineups?: boolean;
          notify_table_change?: boolean;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          date: string;
          match_title: string;
          team_home: string;
          team_away: string;
          championship: string;
          time_br: string;
          channels: Json;
          channel_types: string[];
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          date: string;
          match_title: string;
          team_home: string;
          team_away: string;
          championship: string;
          time_br: string;
          channels?: Json;
          channel_types?: string[];
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          match_title?: string;
          team_home?: string;
          team_away?: string;
          championship?: string;
          time_br?: string;
          channels?: Json;
          channel_types?: string[];
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sent_notifications_log: {
        Row: {
          id: string;
          match_id: string;
          event_type: string;
          title: string;
          body: string;
          recipient_count: number;
          sent_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          event_type: string;
          title: string;
          body: string;
          recipient_count?: number;
          sent_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          event_type?: string;
          title?: string;
          body?: string;
          recipient_count?: number;
          sent_at?: string;
        };
        Relationships: [];
      };
      sync_logs: {
        Row: {
          id: string;
          last_sync_at: string;
          status: string;
          total_matches: number | null;
          message: string | null;
          source: string | null;
        };
        Insert: {
          id?: string;
          last_sync_at?: string;
          status: string;
          total_matches?: number | null;
          message?: string | null;
          source?: string | null;
        };
        Update: {
          id?: string;
          last_sync_at?: string;
          status?: string;
          total_matches?: number | null;
          message?: string | null;
          source?: string | null;
        };
        Relationships: [];
      };
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
