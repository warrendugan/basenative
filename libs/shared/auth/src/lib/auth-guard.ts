import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthContext } from './auth-context.service';

export const authGuard: CanActivateFn = () => {
  const authContext = inject(AuthContext);
  const router = inject(Router);

  if (authContext.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const noAuthGuard: CanActivateFn = () => {
  const authContext = inject(AuthContext);
  const router = inject(Router);

  if (!authContext.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
