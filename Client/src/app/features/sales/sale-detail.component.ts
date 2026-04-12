import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InputComponent } from '../../shared/components/ui';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SalesService } from './sales.service';
import { PageStateComponent } from '../../shared/components/page-state/page-state.component';

@Component({
  standalone: true,
  selector: 'app-sale-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    PageStateComponent,
    MatSnackBarModule,
    ReactiveFormsModule,
    InputComponent,
    RouterLink,
  ],
  templateUrl: './sale-detail.component.html',
})
export class SaleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SalesService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  receipt: import('./sales.service').Receipt | null = null;
  loading = true;
  error: string | null = null;

  refundForm = this.fb.nonNullable.group({ reason: [''] });

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'refunded': return 'bg-rose-500/10 text-rose-600 border-rose-200';
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
    this.api.getReceipt(id).subscribe({
      next: (res) => {
        this.receipt = res.data.receipt;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Failed';
        this.loading = false;
      },
    });
  }

  refund(): void {
    if (!this.receipt) {
      return;
    }
    this.api.refund(this.receipt._id, { reason: this.refundForm.value.reason || undefined }).subscribe({
      next: () => {
        this.snack.open('Refunded', 'OK', { duration: 4000 });
        this.fetch();
      },
      error: (e) => this.snack.open(e?.error?.message || 'Error', 'OK', { duration: 6000 }),
    });
  }
}
