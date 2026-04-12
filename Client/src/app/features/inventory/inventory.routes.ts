import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard(['admin', 'manager', 'cashier'])],
    loadComponent: () => import('./inventory-list.component').then((m) => m.InventoryListComponent),
    data: { breadcrumb: 'Inventory' },
  },
];
