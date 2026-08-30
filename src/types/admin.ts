export interface Product {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  items?: OrderItem[];
}

export interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
  lastOrderAt?: string | null;
}
