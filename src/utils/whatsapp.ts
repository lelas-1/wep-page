import type { Product } from "../types/admin";

export function createWhatsAppOrderLink(product: Product, lang: "ar" | "en", whatsappNumber: string, quantity = 1): string {
  const name = lang === "ar" ? product.nameAr || product.name : product.name;
  const unitPrice = product.salePrice ?? product.price;
  const total = unitPrice * quantity;
  const message =
    lang === "ar"
      ? `مرحباً، أريد طلب المنتج:\n\nالمنتج: ${name}\nالكمية: ${quantity}\nالسعر: ${unitPrice} ${product.currency}\nالإجمالي: ${total} ${product.currency}\n\nيرجى تزويدي بالمزيد من التفاصيل.`
      : `Hello, I would like to order:\n\nProduct: ${name}\nQuantity: ${quantity}\nPrice: ${unitPrice} ${product.currency}\nTotal: ${total} ${product.currency}\n\nPlease provide more details.`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppGeneralLink(lang: "ar" | "en", whatsappNumber: string): string {
  const message = lang === "ar" ? "مرحباً، أريد الاستفسار عن الباقات المتوفرة." : "Hello, I'd like to ask about available bouquets.";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
