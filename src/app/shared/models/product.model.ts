// Este modelo debe coincidir con la respuesta de tu API de NestJS

export interface Attribute {
  key: string;
  value: string;
}

export interface ProductVariant {
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  attributes: Attribute[];
  images?: string[];
}

export interface Product {
  _id: string; // Mongoose usa _id
  name: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  variants: ProductVariant[];
  isActive: boolean;
  category: any; // Podés crear un modelo Category más adelante
  brand?: any;   // Podés crear un modelo Brand más adelante
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
