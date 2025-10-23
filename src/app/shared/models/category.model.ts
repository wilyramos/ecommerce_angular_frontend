// File: frontend/src/app/shared/models/category.model.ts

/**
 * Define la estructura de un atributo dentro de una categoría.
 * Mongoose añade automáticamente un _id a cada sub-documento en el array.
 */
export interface CategoryAttribute {
  _id?: string; // Mongoose asigna un ObjectId a cada subdocumento en el array 'attributes'
  name: string;
  values: string[];
}

/**
 * Define la estructura completa de una Categoría tal como se recibe del backend.
 */
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

  // attributes es un array de objetos CategoryAttribute. En tu esquema, tiene un default de [],
  // por lo que debe ser un array obligatorio.
  attributes: CategoryAttribute[];

  // Campos de Timestamps de Mongoose
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String

  // Propiedad usada SOLAMENTE por el frontend para construir la vista de árbol anidada
  children?: Category[];
}
