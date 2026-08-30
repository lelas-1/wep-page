import { supabase } from "../lib/supabase";
import type { Order, OrderItem } from "../types/admin";
import type { Database } from "../types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

function rowToOrder(row: OrderRow, items?: OrderItem[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    totalAmount: Number(row.total_amount),
    currency: row.currency,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    items,
  };
}

export const orderService = {
  async list(): Promise<Order[]> {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => rowToOrder(r));
  },

  async updateStatus(id: string, status: Order["status"]): Promise<void> {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  },
};
