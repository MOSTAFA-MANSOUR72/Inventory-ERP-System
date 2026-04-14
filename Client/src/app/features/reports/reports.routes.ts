import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports-dashboard.component').then((m) => m.ReportsDashboardComponent),
    data: { breadcrumb: 'Reports' },
  },
  {
    path: 'branch/:id',
    loadComponent: () => import('./branch-report.component').then((m) => m.BranchReportComponent),
    data: { breadcrumb: 'Branch Report' },
  },
  {
    path: 'manager-overview',
    loadComponent: () => import('./manager-overview-report.component').then((m) => m.ManagerOverviewReportComponent),
    data: { breadcrumb: 'Manager Overview' },
  },
  {
    path: 'products',
    loadComponent: () => import('./products-report.component').then((m) => m.ProductsReportComponent),
    data: { breadcrumb: 'Products Report' },
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./product-detail-report.component').then((m) => m.ProductDetailReportComponent),
    data: { breadcrumb: 'Product Detail Report' },
  },
];
