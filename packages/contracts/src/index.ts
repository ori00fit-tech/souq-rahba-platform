export type Locale = "ar" | "fr" | "en";

export interface Product {
  id: string;
  slug: string;
  sellerId: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  priceMad: number;
  compareAtMad?: number;
  rating: number;
  stock: number;
  status: "draft" | "active" | "archived";
  images: string[];
  category: string;
  tags: string[];
}

export interface Seller {
  id: string;
  slug: string;
  name: string;
  city: string;
  verified: boolean;
  rating: number;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  code: string;
  message: string;
}
