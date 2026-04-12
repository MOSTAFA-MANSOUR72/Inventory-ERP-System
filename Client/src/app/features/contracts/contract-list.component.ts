import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContractService } from './contract.service';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, CardComponent, BadgeComponent } from '../../shared/components/ui';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-contract-list',
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    TranslateModule,
  ],
  templateUrl: './contract-list.component.html',
  styleUrl: './contract-list.component.scss',
})
export class ContractListComponent implements OnInit {
  private readonly api = inject(ContractService);
  readonly auth = inject(AuthService);

  data: import('./contract.service').Contract[] = [];
  loading = false;
  error: string | null = null;
  total = 0;
  totalPages = 1;
  pageSize = 10;
  pageIndex = 0;
  Math = Math;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api
      .list({ page: this.pageIndex + 1, limit: this.pageSize })
      .subscribe({
        next: (res) => {
          this.data = res.data.contracts;
          this.total = res.total;
          this.totalPages = res.pages ?? Math.ceil(res.total / this.pageSize);
          this.loading = false;
        },
        error: (e) => {
          this.error = e?.error?.message || 'Failed';
          this.loading = false;
        },
      });
  }

  onPage(e: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  onApprove(id: string): void {
    if (!confirm('Are you sure you want to approve this contract? This will update inventory.')) return;
    this.loading = true;
    this.api.approve(id).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error = e?.error?.message || 'Approval failed';
        this.loading = false;
      },
    });
  }

  onCancel(id: string): void {
    if (!confirm('Are you sure you want to cancel this contract?')) return;
    this.loading = true;
    this.api.cancel(id).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error = e?.error?.message || 'Cancellation failed';
        this.loading = false;
      },
    });
  }

  branchLabel(c: import('./contract.service').Contract): string {
    const b = c.branch;
    return typeof b === 'object' && b && 'name' in b ? b.name : '—';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
