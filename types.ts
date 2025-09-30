export enum Role {
  CLIENT = 'Client',
  ORGANIZER = 'Organizer',
  // fix: Add SUPER_ADMIN to Role enum
  SUPER_ADMIN = 'Super Admin',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLIC = 'public',
}

// fix: Define User type for mock data
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password?: string;
};

// Base types from schema
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Organizer = Database['public']['Tables']['organizers']['Row'];
export type Event = Database['public']['Tables']['events']['Row'] & { organizer_name?: string };
export type TicketType = Database['public']['Tables']['ticket_types']['Row'];
export type Ticket = Database['public']['Tables']['tickets']['Row'];
export type Speaker = Database['public']['Tables']['speakers']['Row'];

// Enriched types for application use
export type EventWithTickets = Event & {
  ticket_types: TicketType[];
  speakers?: Speaker[];
};

export type PurchasedTicket = Ticket & {
  events: Event;
  ticket_types: TicketType;
}

export type SuperAdmin = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

// Multi-role profile type
export type UserProfile = {
  customer?: Customer;
  organizer?: Organizer;
  super_admin?: SuperAdmin;
  available_roles: Role[];
}

// Auth user type with multi-role support
export type AuthUser = {
  current_role: Role;
  profile: UserProfile;
  data: Customer | Organizer | SuperAdmin;
};


// Auto-generated Supabase types
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
      customers: {
        Row: {
          birthday: string
          country_code: string
          created_at: string | null
          email: string
          first_name: string
          gender: string
          id: number
          id_number: string
          last_name: string
          phone: string
          prefix: string
          supabase_user_id: string | null
        }
        Insert: {
          birthday: string
          country_code: string
          created_at?: string | null
          email: string
          first_name: string
          gender: string
          id?: number
          id_number: string
          last_name: string
          phone: string
          prefix: string
          supabase_user_id?: string | null
        }
        Update: {
          birthday?: string
          country_code?: string
          created_at?: string | null
          email?: string
          first_name?: string
          gender?: string
          id?: number
          id_number?: string
          last_name?: string
          phone?: string
          prefix?: string
          supabase_user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          agenda_url: string
          contact_email: string
          contact_phone: string
          created_at: string | null
          currency: string
          current_attendees: number | null
          description: string
          event_end_datetime: string
          event_info: string
          event_name: string
          event_start_datetime: string
          event_type: string
          facebook_contact: string
          google_map_link: string
          id: number
          instagram_contact: string
          is_active: boolean | null
          line_contact: string
          max_attendees: number
          organizer_id: number
          poster_url: string
          status: string | null
          tiktok_contact: string
          venue: string
          website_url: string
          x_contact: string
          youtube_contact: string
        }
        Insert: {
          agenda_url?: string
          contact_email: string
          contact_phone: string
          created_at?: string | null
          currency: string
          current_attendees?: number | null
          description: string
          event_end_datetime: string
          event_info?: string
          event_name: string
          event_start_datetime: string
          event_type: string
          facebook_contact?: string
          google_map_link?: string
          id?: number
          instagram_contact?: string
          is_active?: boolean | null
          line_contact?: string
          max_attendees: number
          organizer_id: number
          poster_url?: string
          status?: string | null
          tiktok_contact?: string
          venue: string
          website_url?: string
          x_contact?: string
          youtube_contact?: string
        }
        Update: {
          agenda_url?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string | null
          currency?: string
          current_attendees?: number | null
          description?: string
          event_end_datetime?: string
          event_info?: string
          event_name?: string
          event_start_datetime?: string
          event_type?: string
          facebook_contact?: string
          google_map_link?: string
          id?: number
          instagram_contact?: string
          is_active?: boolean | null
          line_contact?: string
          max_attendees?: number
          organizer_id?: number
          poster_url?: string
          status?: string | null
          tiktok_contact?: string
          venue?: string
          website_url?: string
          x_contact?: string
          youtube_contact?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      organizers: {
        Row: {
          additional_notes: string | null
          billing_address: string
          business_type: string
          company_name: string
          contact_person: string
          created_at: string | null
          email: string
          id: number
          invoice_email: string
          maps_link: string | null
          organizer_name: string
          phone: string
          supabase_user_id: string | null
          tax_id: string
        }
        Insert: {
          additional_notes?: string | null
          billing_address: string
          business_type: string
          company_name: string
          contact_person: string
          created_at?: string | null
          email: string
          id?: number
          invoice_email: string
          maps_link?: string | null
          organizer_name: string
          phone: string
          supabase_user_id?: string | null
          tax_id: string
        }
        Update: {
          additional_notes?: string | null
          billing_address?: string
          business_type?: string
          company_name?: string
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: number
          invoice_email?: string
          maps_link?: string | null
          organizer_name?: string
          phone?: string
          supabase_user_id?: string | null
          tax_id?: string
        }
        Relationships: []
      }
      speakers: {
        Row: {
          bio: string | null
          company: string | null
          created_at: string | null
          event_id: number
          id: number
          image_url: string | null
          linkedin_url: string | null
          name: string
          order: number | null
          title: string | null
          twitter_url: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          event_id: number
          id?: number
          image_url?: string | null
          linkedin_url?: string | null
          name: string
          order?: number | null
          title?: string | null
          twitter_url?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          event_id?: number
          id?: number
          image_url?: string | null
          linkedin_url?: string | null
          name?: string
          order?: number | null
          title?: string | null
          twitter_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          benefits: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          event_id: number
          id: number
          is_active: boolean | null
          max_per_order: number | null
          min_per_order: number | null
          name: string
          price: number
          quantity: number
          sale_end_date: string | null
          sale_start_date: string | null
          sold_quantity: number | null
        }
        Insert: {
          benefits?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          event_id: number
          id?: number
          is_active?: boolean | null
          max_per_order?: number | null
          min_per_order?: number | null
          name: string
          price?: number
          quantity: number
          sale_end_date?: string | null
          sale_start_date?: string | null
          sold_quantity?: number | null
        }
        Update: {
          benefits?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          event_id?: number
          id?: number
          is_active?: boolean | null
          max_per_order?: number | null
          min_per_order?: number | null
          name?: string
          price?: number
          quantity?: number
          sale_end_date?: string | null
          sale_start_date?: string | null
          sold_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          checked_in_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: number
          event_id: number
          id: number
          price: number | null
          qr_code: string
          qr_code_url: string | null
          status: string | null
          ticket_number: string
          ticket_type_id: number | null
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id: number
          event_id: number
          id?: number
          price?: number | null
          qr_code: string
          qr_code_url?: string | null
          status?: string | null
          ticket_number: string
          ticket_type_id?: number | null
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: number
          event_id?: number
          id?: number
          price?: number | null
          qr_code?: string
          qr_code_url?: string | null
          status?: string | null
          ticket_number?: string
          ticket_type_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
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