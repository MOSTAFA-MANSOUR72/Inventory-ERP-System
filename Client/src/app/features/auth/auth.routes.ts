import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./login.component').then((m) => m.LoginComponent),
    data: { breadcrumb: 'Sign in' },
  },
  {
    path: 'register',
    loadComponent: () => import('./register.component').then((m) => m.RegisterComponent),
    data: { breadcrumb: 'Create account' },
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password.component').then((m) => m.ForgotPasswordComponent),
    data: { breadcrumb: 'Forgot password' },
  },
];
