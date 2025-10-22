// File: frontend/src/app/shared/models/product.model.ts
import { Category } from "./category.model";
import { Brand } from "./brand.model";

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

// --- MODELO BASE (ligero) ---
export interface ProductBase {
  _id?: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  variants: ProductVariant[];
  isActive: boolean;
  category: string;
  brand?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// --- MODELO EXPANDIDO (con objetos completos) ---
export interface PopulatedProduct extends Omit<ProductBase, 'category' | 'brand'> {
  category: Category;
  brand?: Brand;
};

