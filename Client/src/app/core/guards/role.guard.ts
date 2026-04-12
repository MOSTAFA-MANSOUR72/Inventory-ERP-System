import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowed: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (isPlatformServer(platformId)) {
      return true;
    }

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    const check = (user: { role: UserRole } | null) => {
      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }
      if (allowed.includes(user.role)) {
        return true;
      }
      return router.createUrlTree(['/forbidden']);
    };

    if (auth.user) {
      return check(auth.user);
    }

    return auth.loadMe().pipe(
      map((u) => check(u)),
      catchError(() => of(router.createUrlTree(['/auth/login'])))
    );
  };
}
