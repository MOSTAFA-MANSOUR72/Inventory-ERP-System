import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Prevents authenticated users from viewing login/register. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (isPlatformServer(platformId)) {
    return true;
  }

  if (!auth.isAuthenticated()) {
    return true;
  }

  if (auth.user) {
    return router.createUrlTree(['/dashboard']);
  }

  return auth.loadMe().pipe(
    map(() => router.createUrlTree(['/dashboard'])),
    catchError(() => of(true))
  );
};
