// File: frontend/src/app/core/guards/user-guard.ts
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUserService } from '../services/auth-user';
import { map, catchError, of } from 'rxjs';

export const userGuard: CanActivateFn = (route, state) => {
  const authUser = inject(AuthUserService);
  const router = inject(Router);

  return authUser.getProfile().pipe(
    map(user => {
      if (user.role === 'user') return true;
      router.navigate(['/unauthorized']); // Redirige si no tiene permiso
      return false;
    }),
    catchError(() => {
      // Error (token inválido, expirado, etc.)
      router.navigate(['/']);
      return of(false);
    })
  );
};
