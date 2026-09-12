import { supabase } from "../lib/supabase";
import { createListCache } from "../lib/cache";
import { invalidateCustomersCache } from "./customerService";
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

export interface OrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  currency: string;
  notes?: string | null;
  items: OrderItemInput[];
}

const ordersCache = createListCache<Order>(async () => {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToOrder(r));
}, "wf-cache-orders");

/** Looks up a customer by phone number (the natural key for a WhatsApp-based
 * shop) and reuses it, or creates a new one — so logging repeat orders
 * automatically builds up the customer list instead of duplicating rows. */
async function findOrCreateCustomerId(name: string, phone: string, email: string | null): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id;

  const { data: created, error: createError } = await supabase
    .from("customers")
    .insert({ name, phone, email })
    .select("id")
    .single();
  if (createError) throw createError;
  return created.id;
}

export const orderService = {
  async list(): Promise<Order[]> {
    return ordersCache.get();
  },

  async create(input: OrderInput): Promise<Order> {
    if (input.items.length === 0) throw new Error("An order needs at least one item.");

    const customerId = await findOrCreateCustomerId(input.customerName, input.customerPhone, input.customerEmail ?? null);
    const totalAmount = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        customer_email: input.customerEmail ?? null,
        total_amount: totalAmount,
        currency: input.currency,
        status: "pending",
        notes: input.notes ?? null,
      })
      .select("*")
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from("order_items").insert(
      input.items.map((i) => ({
        order_id: orderRow.id,
        product_id: i.productId,
        product_name: i.productName,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      }))
    );
    if (itemsError) throw itemsError;

    ordersCache.invalidate();
    // findOrCreateCustomerId may have just inserted a brand-new customer row.
    invalidateCustomersCache();

    return rowToOrder(orderRow);
  },

  async updateStatus(id: string, status: Order["status"]): Promise<void> {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
    ordersCache.invalidate();
  },
};
