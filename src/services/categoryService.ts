import { supabase } from "../lib/supabase";
import { createListCache } from "../lib/cache";
import type { Category } from "../types/admin";
import type { Database } from "../types/database";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
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

export interface CategoryInput {
  name: string;
  nameAr: string | null;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
}

const categoriesCache = createListCache<Category>(async () => {
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToCategory);
});

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "category";
  let candidate = root;
  let n = 1;
  while (true) {
    let query = supabase.from("categories").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

export const categoryService = {
  async list(filters?: { activeOnly?: boolean }): Promise<Category[]> {
    const rows = await categoriesCache.get();
    return filters?.activeOnly ? rows.filter((r) => r.active) : rows;
  },

  async create(input: CategoryInput): Promise<Category> {
    const slug = await uniqueSlug(input.name);
    const insert: CategoryInsert = {
      name: input.name,
      name_ar: input.nameAr,
      slug,
      description: input.description ?? null,
      image_url: input.imageUrl ?? null,
      active: input.active,
    };
    const { data, error } = await supabase.from("categories").insert(insert).select("*").single();
    if (error) throw error;
    categoriesCache.invalidate();
    return rowToCategory(data);
  },

  async update(id: string, input: Partial<CategoryInput>): Promise<Category> {
    const patch: Partial<CategoryInsert> = {};
    if (input.name !== undefined) {
      patch.name = input.name;
      patch.slug = await uniqueSlug(input.name, id);
    }
    if (input.nameAr !== undefined) patch.name_ar = input.nameAr;
    if (input.description !== undefined) patch.description = input.description;
    if (input.imageUrl !== undefined) patch.image_url = input.imageUrl;
    if (input.active !== undefined) patch.active = input.active;

    const { data, error } = await supabase.from("categories").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    categoriesCache.invalidate();
    return rowToCategory(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    categoriesCache.invalidate();
  },
};
