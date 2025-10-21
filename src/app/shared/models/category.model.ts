//File: frontend/src/app/shared/models/category.model.ts

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: string | Category | null;
}
