import { supabase } from "../lib/supabase";
import { createListCache } from "../lib/cache";
import { orderService } from "./orderService";
import type { Customer } from "../types/admin";

interface RawCustomer {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
}

const customersCache = createListCache<RawCustomer>(async () => {
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    notes: c.notes,
    createdAt: c.created_at,
  }));
}, "wf-cache-customers");

/** Called by orderService after creating an order, since that flow can also
 * insert a brand-new customer row (find-or-create by phone number). */
export function invalidateCustomersCache() {
  customersCache.invalidate();
}

export const customerService = {
  async list(): Promise<Customer[]> {
    // Both reads are cached (orderService.list() reuses its own cache), so
    // this is instant on repeat visits instead of two fresh network calls.
    const [customers, orders] = await Promise.all([customersCache.get(), orderService.list()]);

    return customers.map((c) => {
      const theirOrders = orders.filter((o) => o.customerId === c.id);
      const totalSpent = theirOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const lastOrderAt = theirOrders.length
        ? theirOrders.map((o) => o.createdAt).sort().reverse()[0]
        : null;
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        createdAt: c.createdAt,
        orderCount: theirOrders.length,
        totalSpent,
        lastOrderAt,
      };
    });
  },
};
