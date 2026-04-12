import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH } from '../http/http-context';
import { User } from '../models/user.model';

const STORAGE_ACCESS = 'inventory_access_token';
const STORAGE_REFRESH = 'inventory_refresh_token';

interface AuthResponse {
  status: string;
  token: string;
  refreshToken: string;
  data: { user: User };
}

interface MeResponse {
  status: string;
  data: { user: User };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshInFlight$: Observable<void> | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.accessToken = sessionStorage.getItem(STORAGE_ACCESS);
      this.refreshToken = sessionStorage.getItem(STORAGE_REFRESH);
    }
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  setUserFromPayload(user: User): void {
    this.userSubject.next(user);
  }

  private persistTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(STORAGE_ACCESS, access);
      sessionStorage.setItem(STORAGE_REFRESH, refresh);
    }
  }

  clearSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.userSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(STORAGE_ACCESS);
      sessionStorage.removeItem(STORAGE_REFRESH);
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/login`, { email, password }, {
        context: new HttpContext().set(SKIP_AUTH, true),
      })
      .pipe(
        tap((res) => {
          this.persistTokens(res.token, res.refreshToken);
          this.userSubject.next(res.data.user);
        }),
        map((res) => res.data.user)
      );
  }

  register(body: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Observable<User> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/signup`, body, {
        context: new HttpContext().set(SKIP_AUTH, true),
      })
      .pipe(
        tap((res) => {
          this.persistTokens(res.token, res.refreshToken);
          this.userSubject.next(res.data.user);
        }),
        map((res) => res.data.user)
      );
  }

  loadMe(): Observable<User> {
    return this.http.get<MeResponse>(`${environment.apiUrl}/me`).pipe(
      tap((res) => this.userSubject.next(res.data.user)),
      map((res) => res.data.user),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  /** Refresh access + refresh tokens. */
  refreshSession(): Observable<void> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }
    const refresh = this.refreshToken;
    if (!refresh) {
      return throwError(() => new Error('No refresh token'));
    }
    this.refreshInFlight$ = this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/refreshToken`,
        { refreshToken: refresh },
        { context: new HttpContext().set(SKIP_AUTH, true) }
      )
      .pipe(
        tap((res) => this.persistTokens(res.token, res.refreshToken)),
        map(() => undefined),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1)
      );
    return this.refreshInFlight$;
  }

  updatePassword(body: {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
  }): Observable<void> {
    return this.http.patch<AuthResponse>(`${environment.apiUrl}/updateMyPassword`, body).pipe(
      tap((res) => this.persistTokens(res.token, res.refreshToken)),
      map(() => undefined)
    );
  }

  logout(navigate = true): void {
    this.clearSession();
    if (navigate) {
      void this.router.navigate(['/auth/login']);
    }
  }

  /** Bootstrap current user if tokens exist (client only). */
  tryRestoreSession(): Observable<User | null> {
    if (!isPlatformBrowser(this.platformId) || !this.accessToken) {
      return of(null);
    }
    return this.loadMe().pipe(catchError(() => of(null)));
  }
}
