export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          business_name: string
          email: string
          google_maps_link: string | null
          qr_code_id: string | null
          auto_redirect_to_google: boolean | null
          show_google_prompt: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          business_name: string
          email: string
          google_maps_link?: string | null
          qr_code_id?: string | null
          auto_redirect_to_google?: boolean | null
          show_google_prompt?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          email?: string
          google_maps_link?: string | null
          qr_code_id?: string | null
          auto_redirect_to_google?: boolean | null
          show_google_prompt?: boolean | null
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
      reviews: {
        Row: {
          id: string
          profile_id: string
          rating: number
          comment: string | null
          customer_name: string
          customer_email: string | null
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          rating: number
          comment?: string | null
          customer_name?: string
          customer_email?: string | null
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          rating?: number
          comment?: string | null
          customer_name?: string
          customer_email?: string | null
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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

// Tip kısayolları
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

// Uygulama tipleri
export interface ReviewWithProfile extends Review {
  profile?: Profile
}

export interface DashboardStats {
  totalReviews: number
  averageRating: number
  internalReviews: number
  googleReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface ReviewFormData {
  rating: number
  comment: string
  customerName: string
  customerEmail: string
}