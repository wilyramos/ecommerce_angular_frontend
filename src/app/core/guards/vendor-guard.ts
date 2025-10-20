import { CanActivateFn } from '@angular/router';

export const vendorGuard: CanActivateFn = (route, state) => {
  return true;
};
