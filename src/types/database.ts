export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          name_ar: string | null;
          slug: string;
          description: string | null;
          image_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_ar?: string | null;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          name_ar: string | null;
          slug: string;
          description: string | null;
          description_ar: string | null;
          price: number;
          sale_price: number | null;
          currency: string;
          category_id: string | null;
          stock_quantity: number;
          sku: string | null;
          image_url: string | null;
          featured: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_ar?: string | null;
          slug: string;
          description?: string | null;
          description_ar?: string | null;
          price: number;
          sale_price?: number | null;
          currency?: string;
          category_id?: string | null;
          stock_quantity?: number;
          sku?: string | null;
          image_url?: string | null;
          featured?: boolean;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          email: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          total_amount: number;
          currency: string;
          status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          total_amount?: number;
          currency?: string;
          status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          store_name: string;
          store_name_ar: string;
          whatsapp_number: string;
          facebook_url: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          store_name_ar?: string;
          whatsapp_number?: string;
          facebook_url?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
