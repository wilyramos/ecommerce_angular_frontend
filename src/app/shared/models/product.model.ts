//File: frontend/src/app/shared/models/product.model.ts

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface ProductVariant {
  sku: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  attributes: ProductAttribute[];
  images?: string[];
}

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  variants: ProductVariant[];
  isActive: boolean;
  category: string; // ID de categoría
  brand?: string; // ID de marca opcional
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
