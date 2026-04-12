import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { SKIP_AUTH } from '../http/http-context';
import { environment } from '../../../environments/environment';

/** Surfaces server `message` for client errors (403, 5xx) without duplicating auth/session flows. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: unknown) => {
      const e = err as HttpErrorResponse;
      if (req.context.get(SKIP_AUTH) || !req.url.startsWith(environment.apiUrl)) {
        return throwError(() => err);
      }
      const msg =
        typeof e.error === 'object' && e.error && 'message' in e.error
          ? String((e.error as { message: string }).message)
          : e.message;

      if (e.status === 403) {
        snack.open(msg || 'You do not have permission for this action.', 'Dismiss', {
          duration: 7000,
        });
      } else if (e.status >= 500) {
        snack.open(msg || 'Server error. Please try again later.', 'Dismiss', { duration: 7000 });
      }

      return throwError(() => err);
    })
  );
};
