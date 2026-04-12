import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const CONTRACTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./contract-list.component').then((m) => m.ContractListComponent),
    data: { breadcrumb: 'Contracts' },
  },
  {
    path: 'new',
    canActivate: [roleGuard(['cashier'])],
    loadComponent: () => import('./contract-form.component').then((m) => m.ContractFormComponent),
    data: { breadcrumb: 'New' },
  },
  {
    path: ':id',
    loadComponent: () => import('./contract-detail.component').then((m) => m.ContractDetailComponent),
    data: { breadcrumb: 'Contract' },
  },
];
