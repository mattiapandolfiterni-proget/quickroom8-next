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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      compatibility_scores: {
        Row: {
          created_at: string | null
          factors: Json | null
          id: string
          listing_id: string
          score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          factors?: Json | null
          id?: string
          listing_id: string
          score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          factors?: Json | null
          id?: string
          listing_id?: string
          score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_scores_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flatmates: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          listing_id: string
          name: string | null
          nationality: string | null
          occupation: string | null
          profile_id: string | null
          traits: string[] | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          listing_id: string
          name?: string | null
          nationality?: string | null
          occupation?: string | null
          profile_id?: string | null
          traits?: string[] | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          listing_id?: string
          name?: string | null
          nationality?: string | null
          occupation?: string | null
          profile_id?: string | null
          traits?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "flatmates_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flatmates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_boosts: {
        Row: {
          boost_type: string
          created_at: string
          duration_hours: number
          expires_at: string
          id: string
          listing_id: string
          payment_amount: number
          payment_status: string
          starts_at: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          boost_type?: string
          created_at?: string
          duration_hours: number
          expires_at: string
          id?: string
          listing_id: string
          payment_amount: number
          payment_status?: string
          starts_at?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          boost_type?: string
          created_at?: string
          duration_hours?: number
          expires_at?: string
          id?: string
          listing_id?: string
          payment_amount?: number
          payment_status?: string
          starts_at?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_boosts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_views: {
        Row: {
          id: string
          listing_id: string
          session_id: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          listing_id: string
          session_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          listing_id?: string
          session_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_views_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          file_url: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bed_time: string | null
          bio: string | null
          budget_max: number | null
          budget_min: number | null
          cleanliness_level:
            | Database["public"]["Enums"]["cleanliness_level"]
            | null
          cooking_habits: string | null
          created_at: string | null
          diet_preferences: string | null
          email: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          has_pets: boolean | null
          id: string
          interests: string[] | null
          is_id_verified: boolean | null
          is_smoker: boolean | null
          is_social_verified: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          must_have_amenities: string[] | null
          nationality: string | null
          noise_tolerance: Database["public"]["Enums"]["noise_level"] | null
          notification_email: boolean | null
          notification_favorites: boolean | null
          notification_messages: boolean | null
          notification_push: boolean | null
          occupation: string | null
          party_friendly: boolean | null
          pets_description: string | null
          phone: string | null
          preferred_flatmate_age_max: number | null
          preferred_flatmate_age_min: number | null
          preferred_flatmate_gender:
            | Database["public"]["Enums"]["gender"]
            | null
          preferred_flatmate_nationality: string[] | null
          preferred_locations: string[] | null
          preferred_room_type: Database["public"]["Enums"]["room_type"] | null
          social_preference: Database["public"]["Enums"]["social_level"] | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          visitors_preference: string | null
          wake_up_time: string | null
          work_schedule: Database["public"]["Enums"]["work_schedule"] | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bed_time?: string | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cleanliness_level?:
            | Database["public"]["Enums"]["cleanliness_level"]
            | null
          cooking_habits?: string | null
          created_at?: string | null
          diet_preferences?: string | null
          email?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          has_pets?: boolean | null
          id: string
          interests?: string[] | null
          is_id_verified?: boolean | null
          is_smoker?: boolean | null
          is_social_verified?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          must_have_amenities?: string[] | null
          nationality?: string | null
          noise_tolerance?: Database["public"]["Enums"]["noise_level"] | null
          notification_email?: boolean | null
          notification_favorites?: boolean | null
          notification_messages?: boolean | null
          notification_push?: boolean | null
          occupation?: string | null
          party_friendly?: boolean | null
          pets_description?: string | null
          phone?: string | null
          preferred_flatmate_age_max?: number | null
          preferred_flatmate_age_min?: number | null
          preferred_flatmate_gender?:
            | Database["public"]["Enums"]["gender"]
            | null
          preferred_flatmate_nationality?: string[] | null
          preferred_locations?: string[] | null
          preferred_room_type?: Database["public"]["Enums"]["room_type"] | null
          social_preference?: Database["public"]["Enums"]["social_level"] | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          visitors_preference?: string | null
          wake_up_time?: string | null
          work_schedule?: Database["public"]["Enums"]["work_schedule"] | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bed_time?: string | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          cleanliness_level?:
            | Database["public"]["Enums"]["cleanliness_level"]
            | null
          cooking_habits?: string | null
          created_at?: string | null
          diet_preferences?: string | null
          email?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          has_pets?: boolean | null
          id?: string
          interests?: string[] | null
          is_id_verified?: boolean | null
          is_smoker?: boolean | null
          is_social_verified?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          must_have_amenities?: string[] | null
          nationality?: string | null
          noise_tolerance?: Database["public"]["Enums"]["noise_level"] | null
          notification_email?: boolean | null
          notification_favorites?: boolean | null
          notification_messages?: boolean | null
          notification_push?: boolean | null
          occupation?: string | null
          party_friendly?: boolean | null
          pets_description?: string | null
          phone?: string | null
          preferred_flatmate_age_max?: number | null
          preferred_flatmate_age_min?: number | null
          preferred_flatmate_gender?:
            | Database["public"]["Enums"]["gender"]
            | null
          preferred_flatmate_nationality?: string[] | null
          preferred_locations?: string[] | null
          preferred_room_type?: Database["public"]["Enums"]["room_type"] | null
          social_preference?: Database["public"]["Enums"]["social_level"] | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          visitors_preference?: string | null
          wake_up_time?: string | null
          work_schedule?: Database["public"]["Enums"]["work_schedule"] | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_listing_id: string | null
          reported_message_id: string | null
          reported_user_id: string | null
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_listing_id?: string | null
          reported_message_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_listing_id?: string | null
          reported_message_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_listing_id_fkey"
            columns: ["reported_listing_id"]
            isOneToOne: false
            referencedRelation: "room_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_message_id_fkey"
            columns: ["reported_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          listing_id: string | null
          rating: number
          reviewed_id: string
          reviewer_id: string
          status: string | null  // 'pending' | 'approved' | 'rejected'
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          rating: number
          reviewed_id: string
          reviewer_id: string
          status?: string | null  // Defaults to 'pending'
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_listings: {
        Row: {
          address: string | null
          amenities: string[] | null
          available_from: string | null
          available_until: string | null
          bills_included: boolean | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string | null
          description: string | null
          floor_level: number | null
          has_ac: boolean | null
          has_balcony: boolean | null
          has_heating: boolean | null
          has_lift: boolean | null
          has_living_room: boolean | null
          has_parking: boolean | null
          has_private_bathroom: boolean | null
          has_shared_kitchen: boolean | null
          has_wifi: boolean | null
          has_window: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_furnished: boolean | null
          is_pet_friendly: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          owner_id: string
          price: number
          room_size: number | null
          room_type: Database["public"]["Enums"]["room_type"]
          title: string
          total_bathrooms: number | null
          total_bedrooms: number | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          available_from?: string | null
          available_until?: string | null
          bills_included?: boolean | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string | null
          description?: string | null
          floor_level?: number | null
          has_ac?: boolean | null
          has_balcony?: boolean | null
          has_heating?: boolean | null
          has_lift?: boolean | null
          has_living_room?: boolean | null
          has_parking?: boolean | null
          has_private_bathroom?: boolean | null
          has_shared_kitchen?: boolean | null
          has_wifi?: boolean | null
          has_window?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_furnished?: boolean | null
          is_pet_friendly?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          owner_id: string
          price: number
          room_size?: number | null
          room_type: Database["public"]["Enums"]["room_type"]
          title: string
          total_bathrooms?: number | null
          total_bedrooms?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          available_from?: string | null
          available_until?: string | null
          bills_included?: boolean | null
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string | null
          description?: string | null
          floor_level?: number | null
          has_ac?: boolean | null
          has_balcony?: boolean | null
          has_heating?: boolean | null
          has_lift?: boolean | null
          has_living_room?: boolean | null
          has_parking?: boolean | null
          has_private_bathroom?: boolean | null
          has_shared_kitchen?: boolean | null
          has_wifi?: boolean | null
          has_window?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_furnished?: boolean | null
          is_pet_friendly?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          owner_id?: string
          price?: number
          room_size?: number | null
          room_type?: Database["public"]["Enums"]["room_type"]
          title?: string
          total_bathrooms?: number | null
          total_bedrooms?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "room_listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          name: string
          notify_new_matches: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters: Json
          id?: string
          name: string
          notify_new_matches?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          name?: string
          notify_new_matches?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          priority: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string | null
          document_url: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
          verification_type: string
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          verification_type: string
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      viewing_appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          id: string
          listing_id: string
          notes: string | null
          owner_id: string
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          id?: string
          listing_id: string
          notes?: string | null
          owner_id: string
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          id?: string
          listing_id?: string
          notes?: string | null
          owner_id?: string
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewing_appointments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_compatibility_score: {
        Args: { listing_id: string; user_profile_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_listing_boosted: {
        Args: { listing_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      cleanliness_level: "very_clean" | "clean" | "moderate" | "relaxed"
      contract_type: "short_term" | "long_term" | "flexible"
      gender: "male" | "female" | "other" | "prefer_not_to_say"
      noise_level: "very_quiet" | "quiet" | "moderate" | "lively"
      room_type: "private" | "ensuite" | "shared"
      social_level: "very_social" | "social" | "moderate" | "private"
      user_type: "seeker" | "owner" | "tenant"
      work_schedule: "day" | "night" | "flexible" | "remote"
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
      app_role: ["admin", "moderator", "user"],
      cleanliness_level: ["very_clean", "clean", "moderate", "relaxed"],
      contract_type: ["short_term", "long_term", "flexible"],
      gender: ["male", "female", "other", "prefer_not_to_say"],
      noise_level: ["very_quiet", "quiet", "moderate", "lively"],
      room_type: ["private", "ensuite", "shared"],
      social_level: ["very_social", "social", "moderate", "private"],
      user_type: ["seeker", "owner", "tenant"],
      work_schedule: ["day", "night", "flexible", "remote"],
    },
  },
} as const
