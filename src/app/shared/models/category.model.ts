// File: frontend/src/app/shared/models/category.model.ts

export interface CategoryAttribute {
  _id?: string; // Mongoose asigna un ObjectId a cada subdocumento en el array 'attributes'
  name: string;
  values: string[];
  isVariant?: boolean;
  isFilter?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;

  // parentCategory es un ObjectId como string cuando no está poblado, o null
  parentCategory: string | null;

  // ancestors es un array de ObjectIds como strings
  ancestors: string[];

  // path es una cadena generada para la ruta completa (ej: "Moda > Hombre > Camisetas")
  path: string;
  attributes?: CategoryAttribute[];
  image?: string;
  // Campos de Timestamps de Mongoose
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String

  // Propiedad usada SOLAMENTE por el frontend para construir la vista de árbol anidada
  children?: Category[];
}
