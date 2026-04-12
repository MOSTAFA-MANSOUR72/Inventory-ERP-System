import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard(['cashier'])],
    loadComponent: () => import('./sale-list.component').then((m) => m.SaleListComponent),
    data: { breadcrumb: 'Sales' },
  },
  {
    path: 'new',
    canActivate: [roleGuard(['cashier'])],
    loadComponent: () => import('./sale-new.component').then((m) => m.SaleNewComponent),
    data: { breadcrumb: 'New sale' },
  },
  {
    path: ':id',
    canActivate: [roleGuard(['cashier'])],
    loadComponent: () => import('./sale-detail.component').then((m) => m.SaleDetailComponent),
    data: { breadcrumb: 'Receipt' },
  },
];
