import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  todaySales: number;
  openOrders?: number; // Cashier only
  totalProducts?: number; // Manager/Admin
  lowStockCount?: number; // Manager/Admin
  totalContracts?: number; // Manager/Admin
  totalSuppliers?: number; // Manager/Admin
  pendingContracts?: number; // Manager/Admin
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<{ data: { stats: DashboardStats } }> {
    return this.http.get<{ data: { stats: DashboardStats } }>(`${this.base}/stats`);
  }
}
