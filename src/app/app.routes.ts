import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';
import { vendorGuard } from './core/guards/vendor-guard';

export const routes: Routes = [
  // Carga perezosa de las rutas del panel de administrador
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((r) => r.ADMIN_ROUTES),
    canActivate: [adminGuard], // Protege todo el módulo /admin
  },

  // Carga perezosa de las rutas del panel de vendedor
  {
    path: 'vendor',
    loadChildren: () => import('./vendor/vendor.routes').then((r) => r.VENDOR_ROUTES),
    canActivate: [vendorGuard], // Protege todo el módulo /vendor
  },

  // Carga perezosa de las rutas de la tienda pública (esta es la principal)
  {
    path: '',
    loadChildren: () => import('./public/public.routes').then((r) => r.PUBLIC_ROUTES),
  },
];
