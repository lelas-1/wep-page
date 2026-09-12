/**
 * productService — real Supabase-backed implementation.
 *
 * Connected project: aspqohlunqyjvgduqwrm (see .env.local).
 * Table: public.products. RLS: public can read active=true rows;
 * writes require an authenticated session (see src/services/authService.ts).
 *
 * Reads go through a shared in-memory cache (see src/lib/cache.ts) — the
 * table is fetched once and reused across every page/component until a
 * write invalidates it, instead of every consumer independently re-fetching
 * the whole table.
 */
import { supabase } from "../lib/supabase";
import { createListCache } from "../lib/cache";
import type { Product } from "../types/admin";
import type { Database } from "../types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    slug: row.slug,
    description: row.description,
    descriptionAr: row.description_ar,
    price: Number(row.price),
    salePrice: row.sale_price === null ? null : Number(row.sale_price),
    currency: row.currency,
    categoryId: row.category_id,
    stockQuantity: row.stock_quantity,
    sku: row.sku,
    imageUrl: row.image_url,
    featured: row.featured,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export interface ProductInput {
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  price: number;
  salePrice: number | null;
  currency: string;
  categoryId: string | null;
  stockQuantity: number;
  sku: string | null;
  imageUrl: string | null;
  featured: boolean;
  active: boolean;
}

const productsCache = createListCache<Product>(async () => {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}, "wf-cache-products");

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "product";
  let candidate = root;
  let n = 1;
  // Loop until we find a slug not used by another row.
  while (true) {
    let query = supabase.from("products").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

export const productService = {
  async list(filters?: { activeOnly?: boolean }): Promise<Product[]> {
    const rows = await productsCache.get();
    return filters?.activeOnly ? rows.filter((r) => r.active) : rows;
  },

  async get(id: string): Promise<Product | undefined> {
    const rows = await productsCache.get();
    return rows.find((r) => r.id === id);
  },

  /** Public storefront product detail lookup — only ever returns active
   * products, so an inactive product's URL 404s instead of leaking data. */
  async getBySlug(slug: string): Promise<Product | undefined> {
    const rows = await productsCache.get();
    return rows.find((r) => r.slug === slug && r.active);
  },

  async create(input: ProductInput): Promise<Product> {
    const slug = await uniqueSlug(input.name);
    const insert: ProductInsert = {
      name: input.name,
      name_ar: input.nameAr,
      slug,
      description: input.description,
      description_ar: input.descriptionAr,
      price: input.price,
      sale_price: input.salePrice,
      currency: input.currency,
      category_id: input.categoryId,
      stock_quantity: input.stockQuantity,
      sku: input.sku || null,
      image_url: input.imageUrl,
      featured: input.featured,
      active: input.active,
    };
    const { data, error } = await supabase.from("products").insert(insert).select("*").single();
    if (error) throw error;
    productsCache.invalidate();
    return rowToProduct(data);
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const patch: Partial<ProductInsert> = {};
    if (input.name !== undefined) {
      patch.name = input.name;
      patch.slug = await uniqueSlug(input.name, id);
    }
    if (input.nameAr !== undefined) patch.name_ar = input.nameAr;
    if (input.description !== undefined) patch.description = input.description;
    if (input.descriptionAr !== undefined) patch.description_ar = input.descriptionAr;
    if (input.price !== undefined) patch.price = input.price;
    if (input.salePrice !== undefined) patch.sale_price = input.salePrice;
    if (input.currency !== undefined) patch.currency = input.currency;
    if (input.categoryId !== undefined) patch.category_id = input.categoryId;
    if (input.stockQuantity !== undefined) patch.stock_quantity = input.stockQuantity;
    if (input.sku !== undefined) patch.sku = input.sku || null;
    if (input.imageUrl !== undefined) patch.image_url = input.imageUrl;
    if (input.featured !== undefined) patch.featured = input.featured;
    if (input.active !== undefined) patch.active = input.active;

    const { data, error } = await supabase.from("products").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    productsCache.invalidate();
    return rowToProduct(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    productsCache.invalidate();
  },
};

/** Uploads a product image to the `product-images` Storage bucket and
 *  returns its public URL. Requires an authenticated session (RLS). */
export async function uploadProductImage(file: File): Promise<string> {
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) throw new Error("Image must be smaller than 5MB.");
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
