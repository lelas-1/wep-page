import { supabase } from "../lib/supabase";
import type { Customer } from "../types/admin";

export const customerService = {
  async list(): Promise<Customer[]> {
    const { data: customers, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    if (!customers) return [];

    // Compute order stats per customer from real orders (no fabricated values).
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("customer_id, total_amount, created_at");
    if (ordersError) throw ordersError;

    return customers.map((c) => {
      const theirOrders = (orders ?? []).filter((o) => o.customer_id === c.id);
      const totalSpent = theirOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const lastOrderAt = theirOrders.length
        ? theirOrders.map((o) => o.created_at).sort().reverse()[0]
        : null;
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        createdAt: c.created_at,
        orderCount: theirOrders.length,
        totalSpent,
        lastOrderAt,
      };
    });
  },
};
