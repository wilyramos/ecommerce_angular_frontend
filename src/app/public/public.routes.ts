import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';

// Estas son las rutas para la parte pública de la tienda
export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '', // La ruta raíz (ej: www.mitienda.com)
        title: 'Inicio', // Título para la pestaña del navegador
        loadComponent: () =>
          import('./features/home/home').then(
            (c) => c.Home,
          ),
      },
      // Aquí añadirás las rutas para /products, /cart, etc. más adelante
    ],
  },
];
