import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard(['admin', 'manager'])],
    loadComponent: () => import('./user-list.component').then((m) => m.UserListComponent),
    data: { breadcrumb: 'Users' },
  },
];
