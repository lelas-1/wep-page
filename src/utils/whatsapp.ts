import type { Product } from "../types/admin";

export function createWhatsAppOrderLink(product: Product, lang: "ar" | "en", whatsappNumber: string): string {
  const name = lang === "ar" ? product.nameAr || product.name : product.name;
  const price = product.salePrice ?? product.price;
  const message =
    lang === "ar"
      ? `مرحباً، أريد طلب المنتج:\n\nالمنتج: ${name}\nالسعر: ${price} ${product.currency}\n\nيرجى تزويدي بالمزيد من التفاصيل.`
      : `Hello, I would like to order:\n\nProduct: ${name}\nPrice: ${price} ${product.currency}\n\nPlease provide more details.`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppGeneralLink(lang: "ar" | "en", whatsappNumber: string): string {
  const message = lang === "ar" ? "مرحباً، أريد الاستفسار عن الباقات المتوفرة." : "Hello, I'd like to ask about available bouquets.";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
