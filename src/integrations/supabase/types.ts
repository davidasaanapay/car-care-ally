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
      ai_knowledge: {
        Row: {
          answer: string
          created_at: string
          hits: number
          id: string
          question: string
          question_norm: string
          vehicle_context: string | null
        }
        Insert: {
          answer: string
          created_at?: string
          hits?: number
          id?: string
          question: string
          question_norm: string
          vehicle_context?: string | null
        }
        Update: {
          answer?: string
          created_at?: string
          hits?: number
          id?: string
          question?: string
          question_norm?: string
          vehicle_context?: string | null
        }
        Relationships: []
      }
      appointment_parts: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          marketplace_item_id: string | null
          quantity: number
          shop_id: string
          title: string
          unit_price: number
          verified_by: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          marketplace_item_id?: string | null
          quantity?: number
          shop_id: string
          title: string
          unit_price?: number
          verified_by?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          marketplace_item_id?: string | null
          quantity?: number
          shop_id?: string
          title?: string
          unit_price?: number
          verified_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_parts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_parts_marketplace_item_id_fkey"
            columns: ["marketplace_item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          closed_at: string | null
          created_at: string
          customer_id: string | null
          eta: string | null
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
          stage_note: string | null
          status: string
          updated_at: string
          vehicle_id: string | null
          vehicle_summary: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          eta?: string | null
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
          stage_note?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
          vehicle_summary?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          eta?: string | null
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
          stage_note?: string | null
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
            referencedRelation: "public_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop_fee_ledger"
            referencedColumns: ["shop_id"]
          },
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
            referencedRelation: "public_specialists"
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
      audit_log: {
        Row: {
          actor_id: string | null
          appointment_id: string | null
          created_at: string
          customer_id: string | null
          details: Json
          event_type: string
          id: string
          shop_id: string | null
        }
        Insert: {
          actor_id?: string | null
          appointment_id?: string | null
          created_at?: string
          customer_id?: string | null
          details?: Json
          event_type: string
          id?: string
          shop_id?: string | null
        }
        Update: {
          actor_id?: string | null
          appointment_id?: string | null
          created_at?: string
          customer_id?: string | null
          details?: Json
          event_type?: string
          id?: string
          shop_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
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
          customer_decision: string | null
          customer_id: string | null
          dispute_reason: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_channel: string | null
          payment_date: string | null
          payment_reference: string | null
          proof_path: string | null
          shop_id: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          work_summary: string | null
        }
        Insert: {
          appointment_fee?: number
          appointment_id?: string | null
          created_at?: string
          currency?: string
          customer_decision?: string | null
          customer_id?: string | null
          dispute_reason?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_channel?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          proof_path?: string | null
          shop_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          work_summary?: string | null
        }
        Update: {
          appointment_fee?: number
          appointment_id?: string | null
          created_at?: string
          currency?: string
          customer_decision?: string | null
          customer_id?: string | null
          dispute_reason?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_channel?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          proof_path?: string | null
          shop_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          work_summary?: string | null
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
            referencedRelation: "public_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop_fee_ledger"
            referencedColumns: ["shop_id"]
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
      maintenance_reminders: {
        Row: {
          due_date: string | null
          id: string
          owner_id: string
          reminder_type: string
          sent_at: string
          vehicle_id: string
        }
        Insert: {
          due_date?: string | null
          id?: string
          owner_id: string
          reminder_type: string
          sent_at?: string
          vehicle_id: string
        }
        Update: {
          due_date?: string | null
          id?: string
          owner_id?: string
          reminder_type?: string
          sent_at?: string
          vehicle_id?: string
        }
        Relationships: []
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
            referencedRelation: "public_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop_fee_ledger"
            referencedColumns: ["shop_id"]
          },
          {
            foreignKeyName: "marketplace_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      media_uploads: {
        Row: {
          appointment_id: string | null
          caption: string | null
          captured_at: string
          context: string
          created_at: string
          diagnostic_id: string | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploader_id: string
          uploader_role: string
          vehicle_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          caption?: string | null
          captured_at?: string
          context?: string
          created_at?: string
          diagnostic_id?: string | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploader_id: string
          uploader_role?: string
          vehicle_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          caption?: string | null
          captured_at?: string
          context?: string
          created_at?: string
          diagnostic_id?: string | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploader_id?: string
          uploader_role?: string
          vehicle_id?: string | null
        }
        Relationships: []
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
      service_catalog: {
        Row: {
          active: boolean
          code: string
          created_at: string
          default_interval_miles: number | null
          default_interval_months: number | null
          description: string | null
          id: string
          name: string
          typical_cost_high: number | null
          typical_cost_low: number | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          default_interval_miles?: number | null
          default_interval_months?: number | null
          description?: string | null
          id?: string
          name: string
          typical_cost_high?: number | null
          typical_cost_low?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          default_interval_miles?: number | null
          default_interval_months?: number | null
          description?: string | null
          id?: string
          name?: string
          typical_cost_high?: number | null
          typical_cost_low?: number | null
        }
        Relationships: []
      }
      shop_fee_payments: {
        Row: {
          amount_usd: number
          created_at: string
          id: string
          method: string | null
          period: string
          recorded_by: string | null
          reference: string | null
          shop_id: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          id?: string
          method?: string | null
          period: string
          recorded_by?: string | null
          reference?: string | null
          shop_id: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          id?: string
          method?: string | null
          period?: string
          recorded_by?: string | null
          reference?: string | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_fee_payments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "public_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_fee_payments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop_fee_ledger"
            referencedColumns: ["shop_id"]
          },
          {
            foreignKeyName: "shop_fee_payments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_services: {
        Row: {
          active: boolean
          created_at: string
          duration_minutes: number
          id: string
          name: string
          price_usd: number
          shop_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          duration_minutes?: number
          id?: string
          name: string
          price_usd?: number
          shop_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          duration_minutes?: number
          id?: string
          name?: string
          price_usd?: number
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "public_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop_fee_ledger"
            referencedColumns: ["shop_id"]
          },
          {
            foreignKeyName: "shop_services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          accepts_apple_pay: boolean
          accepts_cards: boolean
          accepts_cashapp: boolean
          accepts_google_pay: boolean
          address: string | null
          business_type: string
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          has_own_stripe: boolean
          hours: Json
          id: string
          marketplace_fee_pct: number
          marketplace_fee_schedule: string
          monthly_subscription_usd: number
          name: string
          owner_id: string | null
          per_appointment_fee_usd: number
          phone: string | null
          plan: string
          rating: number | null
          slug: string
          state: string | null
          status: string
          timezone: string
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
          business_type?: string
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          has_own_stripe?: boolean
          hours?: Json
          id?: string
          marketplace_fee_pct?: number
          marketplace_fee_schedule?: string
          monthly_subscription_usd?: number
          name: string
          owner_id?: string | null
          per_appointment_fee_usd?: number
          phone?: string | null
          plan?: string
          rating?: number | null
          slug: string
          state?: string | null
          status?: string
          timezone?: string
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
          business_type?: string
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          has_own_stripe?: boolean
          hours?: Json
          id?: string
          marketplace_fee_pct?: number
          marketplace_fee_schedule?: string
          monthly_subscription_usd?: number
          name?: string
          owner_id?: string | null
          per_appointment_fee_usd?: number
          phone?: string | null
          plan?: string
          rating?: number | null
          slug?: string
          state?: string | null
          status?: string
          timezone?: string
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
            referencedRelation: "public_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialists_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop_fee_ledger"
            referencedColumns: ["shop_id"]
          },
          {
            foreignKeyName: "specialists_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role: string
          shop_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          role?: string
          shop_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          shop_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
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
      vehicle_services: {
        Row: {
          appointment_id: string | null
          cost_usd: number | null
          created_at: string
          id: string
          mileage_at_service: number | null
          next_due_date: string | null
          next_due_mileage: number | null
          notes: string | null
          owner_id: string
          performed_on: string
          service_code: string
          shop_id: string | null
          vehicle_id: string
        }
        Insert: {
          appointment_id?: string | null
          cost_usd?: number | null
          created_at?: string
          id?: string
          mileage_at_service?: number | null
          next_due_date?: string | null
          next_due_mileage?: number | null
          notes?: string | null
          owner_id: string
          performed_on: string
          service_code: string
          shop_id?: string | null
          vehicle_id: string
        }
        Update: {
          appointment_id?: string | null
          cost_usd?: number | null
          created_at?: string
          id?: string
          mileage_at_service?: number | null
          next_due_date?: string | null
          next_due_mileage?: number | null
          notes?: string | null
          owner_id?: string
          performed_on?: string
          service_code?: string
          shop_id?: string | null
          vehicle_id?: string
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
      public_shops: {
        Row: {
          accepts_apple_pay: boolean | null
          accepts_cards: boolean | null
          accepts_cashapp: boolean | null
          accepts_google_pay: boolean | null
          address: string | null
          city: string | null
          description: string | null
          email: string | null
          id: string | null
          name: string | null
          phone: string | null
          rating: number | null
          slug: string | null
          state: string | null
          status: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          accepts_apple_pay?: boolean | null
          accepts_cards?: boolean | null
          accepts_cashapp?: boolean | null
          accepts_google_pay?: boolean | null
          address?: string | null
          city?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          rating?: number | null
          slug?: string | null
          state?: string | null
          status?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          accepts_apple_pay?: boolean | null
          accepts_cards?: boolean | null
          accepts_cashapp?: boolean | null
          accepts_google_pay?: boolean | null
          address?: string | null
          city?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          rating?: number | null
          slug?: string | null
          state?: string | null
          status?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      public_specialists: {
        Row: {
          bio: string | null
          certifications: string[] | null
          city: string | null
          full_name: string | null
          id: string | null
          is_independent: boolean | null
          shop_id: string | null
          specialties: string[] | null
          state: string | null
          status: string | null
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          full_name?: string | null
          id?: string | null
          is_independent?: boolean | null
          shop_id?: string | null
          specialties?: string[] | null
          state?: string | null
          status?: string | null
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          full_name?: string | null
          id?: string | null
          is_independent?: boolean | null
          shop_id?: string | null
          specialties?: string[] | null
          state?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialists_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "public_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialists_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop_fee_ledger"
            referencedColumns: ["shop_id"]
          },
          {
            foreignKeyName: "specialists_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_fee_ledger: {
        Row: {
          appointment_fees_usd: number | null
          appointments_booked: number | null
          fee_per_appointment: number | null
          paid_usd: number | null
          period: string | null
          plan: string | null
          shop_id: string | null
          shop_name: string | null
          subscription_usd: number | null
          total_due_usd: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_team_member_invite: {
        Args: never
        Returns: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role: string
          shop_id: string
          status: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "team_members"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      close_appointment: { Args: { _appt: string }; Returns: undefined }
      customer_invoice_decision: {
        Args: { _approve: boolean; _invoice: string; _reason: string }
        Returns: undefined
      }
      customer_set_stage: {
        Args: { _appt: string; _stage: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_shop_view: { Args: { _shop: string }; Returns: undefined }
      owns_shop: { Args: { _shop: string }; Returns: boolean }
      record_invoice_payment: {
        Args: {
          _channel: string
          _date: string
          _invoice: string
          _proof: string
          _reference: string
        }
        Returns: undefined
      }
      register_shop: {
        Args: {
          _address: string
          _business_type: string
          _city: string
          _description: string
          _email: string
          _hours: Json
          _name: string
          _phone: string
          _plan: string
          _state: string
          _timezone: string
          _website: string
          _zip: string
        }
        Returns: string
      }
      write_audit: {
        Args: {
          _appt: string
          _customer: string
          _details: Json
          _event: string
          _shop: string
        }
        Returns: undefined
      }
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
    Enums: {
      app_role: ["super_admin", "shop_owner", "specialist", "customer"],
    },
  },
} as const
