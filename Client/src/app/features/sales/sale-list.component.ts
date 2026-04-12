import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SalesService } from './sales.service';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, CardComponent, BadgeComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-sale-list',
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
  templateUrl: './sale-list.component.html',
})
export class SaleListComponent implements OnInit {
  private readonly api = inject(SalesService);

  data: import('./sales.service').Receipt[] = [];
  loading = false;
  error: string | null = null;
  total = 0;
  totalPages = 1;
  pageIndex = 0;
  pageSize = 10;
  Math = Math;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api
      .listReceipts({ page: this.pageIndex + 1, limit: this.pageSize })
      .subscribe({
        next: (res) => {
          this.data = res.data.receipts;
          this.total = res.total;
          this.totalPages = res.pages ?? Math.ceil(res.total / this.pageSize);
          this.loading = false;
        },
        error: (e) => {
          this.error = e?.error?.message || 'Failed to load sales';
          this.loading = false;
        },
      });
  }

  onPage(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }
}
