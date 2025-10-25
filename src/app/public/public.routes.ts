import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        title: 'Inicio | Mi Tienda',
        loadComponent: () =>
          import('./features/home/home').then((c) => c.Home),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then(
            (r) => r.PRODUCTS_ROUTES
          ),
      },
    ],
  },
];
