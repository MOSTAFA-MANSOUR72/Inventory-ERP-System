import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const BRANCHES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard(['admin', 'manager'])],
    loadComponent: () => import('./branch-list.component').then((m) => m.BranchListComponent),
    data: { breadcrumb: 'Branches' },
  },
];
