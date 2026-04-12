import { AsyncPipe, CommonModule, SlicePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ContractService } from '../contracts/contract.service';
import { DashboardService, DashboardStats } from './dashboard.service';
import {
  StatCardComponent,
  CardComponent,
  ButtonComponent,
} from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    AsyncPipe,
    CommonModule,
    SlicePipe,
    RouterLink,
    TranslateModule,
    StatCardComponent,
    CardComponent,
    ButtonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly dashboardApi = inject(DashboardService);

  loading = false;
  stats: DashboardStats = {
    todaySales: 0,
    openOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalContracts: 0,
    totalSuppliers: 0,
    pendingContracts: 0,
  };

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardApi.getStats().subscribe({
      next: (res) => {
        this.stats = res.data.stats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get dailyTargetProgress(): number {
    const target = 2000;
    return Math.min((this.stats.todaySales / target) * 100, 100);
  }
}
