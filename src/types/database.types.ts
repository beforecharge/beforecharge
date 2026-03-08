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
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
          is_default: boolean
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          color: string
          is_default?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
          is_default?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          subscription_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          subscription_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          subscription_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          default_currency: string
          timezone: string
          notification_preferences: Json
          plan_type: string
          plan_expires_at: string | null
          plan_provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          timezone?: string
          notification_preferences?: Json
          plan_type?: string
          plan_expires_at?: string | null
          plan_provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          timezone?: string
          notification_preferences?: Json
          plan_type?: string
          plan_expires_at?: string | null
          plan_provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      receipts: {
        Row: {
          id: string
          subscription_id: string
          file_name: string
          file_url: string
          file_size: number
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          file_name: string
          file_url: string
          file_size: number
          mime_type: string
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          file_name?: string
          file_url?: string
          file_size?: number
          mime_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      reminder_jobs: {
        Row: {
          id: string
          subscription_id: string
          user_id: string
          reminder_date: string
          notification_type: string
          is_sent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          user_id: string
          reminder_date: string
          notification_type: string
          is_sent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          user_id?: string
          reminder_date?: string
          notification_type?: string
          is_sent?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_jobs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          cost: number
          currency: string
          billing_cycle: string
          renewal_date: string
          category_id: string
          tags: string[]
          receipt_url: string | null
          is_active: boolean
          last_used_date: string | null
          trial_end_date: string | null
          website_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          cost: number
          currency?: string
          billing_cycle: string
          renewal_date: string
          category_id: string
          tags?: string[]
          receipt_url?: string | null
          is_active?: boolean
          last_used_date?: string | null
          trial_end_date?: string | null
          website_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          cost?: number
          currency?: string
          billing_cycle?: string
          renewal_date?: string
          category_id?: string
          tags?: string[]
          receipt_url?: string | null
          is_active?: boolean
          last_used_date?: string | null
          trial_end_date?: string | null
          website_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_monthly_spending: {
        Args: {
          user_id: string
          start_date: string
          end_date: string
        }
        Returns: {
          month: string
          total_amount: number
        }[]
      }
      get_category_spending: {
        Args: {
          user_id: string
        }
        Returns: {
          category_name: string
          total_amount: number
          subscription_count: number
          color: string
        }[]
      }
      get_upcoming_renewals: {
        Args: {
          user_id: string
          days_ahead: number
        }
        Returns: {
          subscription_id: string
          name: string
          cost: number
          currency: string
          renewal_date: string
          days_until_renewal: number
          category_name: string
          category_color: string
        }[]
      }
      get_unused_subscriptions: {
        Args: {
          user_id: string
          days_unused: number
        }
        Returns: {
          subscription_id: string
          name: string
          cost: number
          currency: string
          last_used_date: string
          days_since_used: number
        }[]
      }
      calculate_annual_savings: {
        Args: {
          user_id: string
        }
        Returns: {
          subscription_id: string
          name: string
          monthly_cost: number
          annual_cost: number
          potential_savings: number
          savings_percentage: number
        }[]
      }
    }
    Enums: {
      billing_cycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
      currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'SEK' | 'NOK' | 'DKK'
      notification_type: 'renewal' | 'trial_ending' | 'price_change' | 'cancellation'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
