import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ContractService } from './contract.service';
import { PageStateComponent } from '../../shared/components/page-state/page-state.component';
import { AuthService } from '../../core/services/auth.service';

import { ButtonComponent } from '../../shared/components/ui/button/button.component';

@Component({
  standalone: true,
  selector: 'app-contract-detail',
  imports: [CommonModule, MatCardModule, MatButtonModule, PageStateComponent, MatSnackBarModule, RouterLink, ButtonComponent],
  templateUrl: './contract-detail.component.html',
})
export class ContractDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ContractService);
  private readonly snack = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  c: import('./contract.service').Contract | null = null;
  loading = true;
  error: string | null = null;

  get canManage(): boolean {
    const role = this.auth.user?.role;
    return role === 'admin' || role === 'manager';
  }

  get totalRevenue(): number {
    if (!this.c) return 0;
    return this.c.products.reduce((acc, p) => acc + (p.sellPrice * p.quantity), 0);
  }

  get profitMargin(): number {
    if (!this.c || this.totalRevenue === 0) return 0;
    return ((this.totalRevenue - this.c.totalAmount) / this.totalRevenue) * 100;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'pending': return 'bg-indigo-500/10 text-indigo-600 border-indigo-200';
      case 'cancelled': return 'bg-rose-500/10 text-rose-600 border-rose-200';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
    }
  }

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Missing id';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.api.getById(id).subscribe({
      next: (res) => {
        this.c = res.data.contract;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Failed';
        this.loading = false;
      },
    });
  }

  approve(): void {
    if (!this.c) {
      return;
    }
    this.api.approve(this.c._id, {}).subscribe({
      next: () => {
        this.snack.open('Contract approved', 'OK', { duration: 4000 });
        this.fetch();
      },
      error: (e) => this.snack.open(e?.error?.message || 'Error', 'OK', { duration: 6000 }),
    });
  }

  cancel(): void {
    if (!this.c) {
      return;
    }
    this.api.cancel(this.c._id).subscribe({
      next: () => {
        this.snack.open('Cancelled', 'OK', { duration: 4000 });
        this.fetch();
      },
      error: (e) => this.snack.open(e?.error?.message || 'Error', 'OK', { duration: 6000 }),
    });
  }

  remove(): void {
    if (!this.c || !confirm('Delete pending contract?')) {
      return;
    }
    this.api.delete(this.c._id).subscribe({
      next: () => void this.router.navigate(['/contracts']),
      error: (e) => this.snack.open(e?.error?.message || 'Error', 'OK', { duration: 6000 }),
    });
  }
}
