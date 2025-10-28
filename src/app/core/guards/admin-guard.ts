import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUserService } from '../services/auth-user';
import { map, tap, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authUser = inject(AuthUserService);
  const router = inject(Router);

  return authUser.getProfile().pipe(
    tap(() => console.log('AdminGuard: obteniendo perfil de usuario')),
    map(user => user.role === 'admin'), // true si admin, false si no
    tap(isAdmin => {
      if (!isAdmin) router.navigate(['/unauthorized']); // navega solo si no es admin
    }),
    catchError(() => {
      router.navigate(['/']); // error en el observable
      return of(false);
    })
  );
};
