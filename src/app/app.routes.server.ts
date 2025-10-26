// File: frontend/src/app/app.routes.server.ts

import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom } from 'rxjs';
import { Category as CategoryService } from './public/features/categories/category';

export const serverRoutes: ServerRoute[] = [
  // Regla para la página de inicio ('/')
  // La prerenderizamos (SSG) porque es pública y queremos que cargue al instante.
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },

  // Regla para las páginas de categorías (la que ya tenías)
  // También la prerenderizamos (SSG) para un SEO y rendimiento óptimos.
  {
    path: 'products/category/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const categoryService = inject(CategoryService);
      const slugs = await firstValueFrom(categoryService.getAllCategorySlugs());
      return slugs.map(slug => ({ slug: slug }));
    },
  },

  // Regla para las rutas protegidas de Admin
  // Usamos SSR porque el contenido es dinámico y específico del usuario.
  // No tiene sentido prerenderizar un panel de administración.
  {
    path: 'admin',
    renderMode: RenderMode.Server,
  },
  {
    path: 'admin/**', // Cubre todas las sub-rutas de admin
    renderMode: RenderMode.Server,
  },

  // Regla para las rutas protegidas de Vendor
  // Misma lógica que admin: usamos SSR para contenido dinámico y protegido.
  {
    path: 'vendor',
    renderMode: RenderMode.Server,
  },
  {
    path: 'vendor/**', // Cubre todas las sub-rutas de vendor
    renderMode: RenderMode.Server,
  },

  // Regla comodín para cualquier otra ruta no definida explícitamente
  // Un buen candidato son las páginas de detalle de producto ('/products/:id')
  // Usamos SSR como un valor predeterminado seguro.
  {
    path: '**',
    renderMode: RenderMode.Server,
  }
];
