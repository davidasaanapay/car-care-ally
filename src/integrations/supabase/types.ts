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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          customer_id: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          issue_summary: string | null
          notes: string | null
          scheduled_for: string
          service_type: string | null
          shop_id: string | null
          specialist_id: string | null
          status: string
          updated_at: string
          vehicle_id: string | null
          vehicle_summary: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          issue_summary?: string | null
          notes?: string | null
          scheduled_for: string
          service_type?: string | null
          shop_id?: string | null
          specialist_id?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
          vehicle_summary?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          issue_summary?: string | null
          notes?: string | null
          scheduled_for?: string
          service_type?: string | null
          shop_id?: string | null
          specialist_id?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
          vehicle_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          ai_assessment: string | null
          created_at: string
          customer_id: string | null
          estimated_cost_high: number | null
          estimated_cost_low: number | null
          id: string
          recommended_action: string | null
          symptoms: Json
          vehicle_data: Json
          vehicle_id: string | null
        }
        Insert: {
          ai_assessment?: string | null
          created_at?: string
          customer_id?: string | null
          estimated_cost_high?: number | null
          estimated_cost_low?: number | null
          id?: string
          recommended_action?: string | null
          symptoms?: Json
          vehicle_data?: Json
          vehicle_id?: string | null
        }
        Update: {
          ai_assessment?: string | null
          created_at?: string
          customer_id?: string | null
          estimated_cost_high?: number | null
          estimated_cost_low?: number | null
          id?: string
          recommended_action?: string | null
          symptoms?: Json
          vehicle_data?: Json
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_credentials: {
        Row: {
          configured_at: string | null
          configured_by: string | null
          is_configured: boolean
          notes: string | null
          provider: string
        }
        Insert: {
          configured_at?: string | null
          configured_by?: string | null
          is_configured?: boolean
          notes?: string | null
          provider: string
        }
        Update: {
          configured_at?: string | null
          configured_by?: string | null
          is_configured?: boolean
          notes?: string | null
          provider?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          kind: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          kind?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          kind?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          appointment_fee: number
          appointment_id: string | null
          created_at: string
          currency: string
          customer_id: string | null
          id: string
          notes: string | null
          paid_at: string | null
          shop_id: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          appointment_fee?: number
          appointment_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          shop_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          appointment_fee?: number
          appointment_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          shop_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          price_usd: number
          shop_id: string
          stock: number
          title: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          price_usd: number
          shop_id: string
          stock?: number
          title: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          price_usd?: number
          shop_id?: string
          stock?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          marketing_emails: boolean
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          marketing_emails?: boolean
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          marketing_emails?: boolean
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          accepts_apple_pay: boolean
          accepts_cards: boolean
          accepts_cashapp: boolean
          accepts_google_pay: boolean
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          has_own_stripe: boolean
          id: string
          marketplace_fee_pct: number
          marketplace_fee_schedule: string
          monthly_subscription_usd: number
          name: string
          owner_id: string | null
          phone: string | null
          rating: number | null
          slug: string
          state: string | null
          status: string
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          accepts_apple_pay?: boolean
          accepts_cards?: boolean
          accepts_cashapp?: boolean
          accepts_google_pay?: boolean
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          has_own_stripe?: boolean
          id?: string
          marketplace_fee_pct?: number
          marketplace_fee_schedule?: string
          monthly_subscription_usd?: number
          name: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          slug: string
          state?: string | null
          status?: string
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          accepts_apple_pay?: boolean
          accepts_cards?: boolean
          accepts_cashapp?: boolean
          accepts_google_pay?: boolean
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          has_own_stripe?: boolean
          id?: string
          marketplace_fee_pct?: number
          marketplace_fee_schedule?: string
          monthly_subscription_usd?: number
          name?: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          slug?: string
          state?: string | null
          status?: string
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      specialists: {
        Row: {
          bio: string | null
          certifications: string[] | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_independent: boolean
          phone: string | null
          shop_id: string | null
          specialties: string[] | null
          state: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_independent?: boolean
          phone?: string | null
          shop_id?: string | null
          specialties?: string[] | null
          state?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_independent?: boolean
          phone?: string | null
          shop_id?: string | null
          specialties?: string[] | null
          state?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialists_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          id: string
          last_service_date: string | null
          license_plate: string | null
          make: string
          mileage: number | null
          model: string
          next_service_due: string | null
          nickname: string | null
          notes: string | null
          owner_id: string
          state: string | null
          tags_renewal_date: string | null
          trim: string | null
          updated_at: string
          vin: string | null
          year: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          last_service_date?: string | null
          license_plate?: string | null
          make: string
          mileage?: number | null
          model: string
          next_service_due?: string | null
          nickname?: string | null
          notes?: string | null
          owner_id: string
          state?: string | null
          tags_renewal_date?: string | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          last_service_date?: string | null
          license_plate?: string | null
          make?: string
          mileage?: number | null
          model?: string
          next_service_due?: string | null
          nickname?: string | null
          notes?: string | null
          owner_id?: string
          state?: string | null
          tags_renewal_date?: string | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "shop_owner" | "specialist" | "customer"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "shop_owner", "specialist", "customer"],
    },
  },
} as const
