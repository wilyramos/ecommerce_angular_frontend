// frontend/src/app/shared/models/product.model.ts
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
  images?: string[]; // URLs
}

export interface ProductBase {
  _id?: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  variants: ProductVariant[];
  isActive?: boolean;
  category: string;  // ID (string)
  brand?: string;    // ID (string)
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PopulatedProduct extends Omit<ProductBase, 'category' | 'brand'> {
  category: Category;
  brand?: Brand;
}
