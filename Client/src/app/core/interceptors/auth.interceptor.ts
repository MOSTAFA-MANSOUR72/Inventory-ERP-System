import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, EMPTY } from 'rxjs';
import { SKIP_AUTH } from '../http/http-context';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);
  const platformId = inject(PLATFORM_ID);

  if (req.context.get(SKIP_AUTH) || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = auth.getAccessToken();

  // If on server and no token, don't even try to send the request.
  // This silences 401 errors in the server console.
  if (isPlatformServer(platformId) && !token) {
    return EMPTY;
  }
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      const e = err as HttpErrorResponse;
      if (e.status !== 401) {
        return throwError(() => err);
      }
      if (!token || req.url.includes('/refreshToken')) {
        return throwError(() => err);
      }
      return auth.refreshSession().pipe(
        switchMap(() => {
          const t = auth.getAccessToken();
          if (!t) {
            return throwError(() => err);
          }
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }));
        }),
        catchError(() => {
          snack.open('Session expired. Please sign in again.', 'Dismiss', { duration: 6000 });
          auth.logout(false);
          void router.navigate(['/auth/login'], { queryParams: { session: 'expired' } });
          return throwError(() => err);
        })
      );
    })
  );
};
