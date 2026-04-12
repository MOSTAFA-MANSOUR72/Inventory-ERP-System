import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

import { AUTH_ROUTES } from './features/auth/auth.routes';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DASHBOARD_ROUTES } from './features/dashboard/dashboard.routes';
import { PRODUCTS_ROUTES } from './features/products/products.routes';
import { INVENTORY_ROUTES } from './features/inventory/inventory.routes';
import { CATEGORIES_ROUTES } from './features/categories/categories.routes';
import { USERS_ROUTES } from './features/users/users.routes';
import { BRANCHES_ROUTES } from './features/branches/branches.routes';
import { PROVIDERS_ROUTES } from './features/providers/providers.routes';
import { CONTRACTS_ROUTES } from './features/contracts/contracts.routes';
import { SALES_ROUTES } from './features/sales/sales.routes';
import { PROFILE_ROUTES } from './features/profile/profile.routes';
import { UnauthorizedComponent } from './features/errors/unauthorized.component';
import { ForbiddenComponent } from './features/errors/forbidden.component';
import { NotFoundComponent } from './features/errors/not-found.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: AUTH_ROUTES,
  },
  {
    path: '',
    canActivate: [authGuard],
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        children: DASHBOARD_ROUTES,
      },
      {
        path: 'products',
        children: PRODUCTS_ROUTES,
      },
      {
        path: 'inventory',
        children: INVENTORY_ROUTES,
      },
      {
        path: 'categories',
        children: CATEGORIES_ROUTES,
      },
      {
        path: 'users',
        children: USERS_ROUTES,
      },
      {
        path: 'branches',
        children: BRANCHES_ROUTES,
      },
      {
        path: 'providers',
        children: PROVIDERS_ROUTES,
      },
      {
        path: 'contracts',
        children: CONTRACTS_ROUTES,
      },
      {
        path: 'sales',
        children: SALES_ROUTES,
      },
      {
        path: 'profile',
        children: PROFILE_ROUTES,
      },
    ],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
