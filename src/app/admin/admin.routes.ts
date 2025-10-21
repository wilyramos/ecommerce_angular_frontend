import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

// Rutas para el panel de administración
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'products',
        title: 'Productos',
        loadComponent: () =>
          import('./features/manage-products/product-list/product-list').then((m) => m.ProductList),
      },
      {
        path: 'categories',
        title: 'Categorías',
        loadComponent: () =>
          import('./features/manage-categories/category-list/category-list').then((m) => m.CategoryListComponent),
      },
      {
        path: 'brands',
        title: 'Marcas',
        loadComponent: () =>
          import('./features/manage-brands/brand-list/brand-list').then((m) => m.BrandListComponent),
      },


      // Otras rutas de administración pueden añadirse aquí

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      }

    ]
  }
];
