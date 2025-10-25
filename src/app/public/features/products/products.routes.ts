import { Routes } from '@angular/router';
import { ProductListPage } from './product-list/product-list.page';
import { ProductDetailPage } from './product-detail/product-detail.page';
import { CategoryPagePage } from './category-page/category-page.page';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductListPage, // /products
  },
  {
    path: 'category/:slug',
    component: CategoryPagePage, // /products/category/zapatillas
  },
  {
    path: ':id',
    component: ProductDetailPage, // /products/123
  },
];
