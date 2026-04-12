import { Routes } from '@angular/router';

export const PROVIDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./provider-list.component').then((m) => m.ProviderListComponent),
    data: { breadcrumb: 'Suppliers' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./provider-detail.component').then((m) => m.ProviderDetailComponent),
    data: { breadcrumb: 'Supplier' },
  },
];
