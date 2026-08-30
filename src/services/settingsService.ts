import { supabase } from "../lib/supabase";

export interface SiteSettings {
  storeName: string;
  storeNameAr: string;
  whatsappNumber: string;
  facebookUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  updatedAt: string;
}

export interface SiteSettingsInput {
  storeName: string;
  storeNameAr: string;
  whatsappNumber: string;
  facebookUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export const settingsService = {
  async get(): Promise<SiteSettings> {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return {
      storeName: data.store_name,
      storeNameAr: data.store_name_ar,
      whatsappNumber: data.whatsapp_number,
      facebookUrl: data.facebook_url,
      email: data.email,
      phone: data.phone,
      address: data.address,
      updatedAt: data.updated_at,
    };
  },

  async update(input: SiteSettingsInput): Promise<SiteSettings> {
    const { data, error } = await supabase
      .from("site_settings")
      .update({
        store_name: input.storeName,
        store_name_ar: input.storeNameAr,
        whatsapp_number: input.whatsappNumber,
        facebook_url: input.facebookUrl,
        email: input.email,
        phone: input.phone,
        address: input.address,
      })
      .eq("id", 1)
      .select("*")
      .single();
    if (error) throw error;
    return {
      storeName: data.store_name,
      storeNameAr: data.store_name_ar,
      whatsappNumber: data.whatsapp_number,
      facebookUrl: data.facebook_url,
      email: data.email,
      phone: data.phone,
      address: data.address,
      updatedAt: data.updated_at,
    };
  },
};
