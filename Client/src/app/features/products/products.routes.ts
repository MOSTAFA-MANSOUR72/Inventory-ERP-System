import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list.component').then((m) => m.ProductListComponent),
    data: { breadcrumb: 'Products' },
  },
  {
    path: 'new',
    canActivate: [roleGuard(['admin', 'manager'])],
    loadComponent: () => import('./product-form.component').then((m) => m.ProductFormComponent),
    data: { breadcrumb: 'New' },
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard(['admin', 'manager'])],
    loadComponent: () => import('./product-form.component').then((m) => m.ProductFormComponent),
    data: { breadcrumb: 'Edit' },
  },
  {
    path: ':id',
    loadComponent: () => import('./product-detail.component').then((m) => m.ProductDetailComponent),
    data: { breadcrumb: 'Details' },
  },
];
