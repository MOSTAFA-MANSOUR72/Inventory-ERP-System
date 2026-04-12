import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule, AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryService } from './inventory.service';
import { InventoryProduct } from '../../core/models/inventory.model';
import { CategoryService } from '../categories/category.service';
import { AuthService } from '../../core/services/auth.service';
import { assetUrl } from '../../core/utils/asset-url';
import { ButtonComponent, CardComponent, InputComponent, BadgeComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-inventory-list',
  imports: [
    CommonModule,
    AsyncPipe,
    RouterLink,
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    ButtonComponent,
    CardComponent,
    InputComponent,
    BadgeComponent,
    TranslateModule,
  ],
  templateUrl: './inventory-list.component.html',
})
export class InventoryListComponent implements OnInit {
  private readonly inventoryApi = inject(InventoryService);
  private readonly categoriesApi = inject(CategoryService);
  readonly auth = inject(AuthService);

  data: InventoryProduct[] = [];
  loading = false;
  error: string | null = null;
  total = 0;
  totalPages = 1;
  pageSize = 6;
  pageIndex = 0;
  
  categories$ = this.categoriesApi.list();
  searchCtrl = new FormControl('', { nonNullable: true });
  categoryCtrl = new FormControl<string | null>(null);

  assetUrl = assetUrl;
  Math = Math;

  ngOnInit(): void {
    this.load();

    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });

    this.categoryCtrl.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.inventoryApi
      .list({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        search: this.searchCtrl.value.trim() || undefined,
        category: this.categoryCtrl.value || undefined,
      })
      .subscribe({
        next: (res) => {
          this.data = res.data.inventoryProducts;
          this.total = res.total;
          this.totalPages = res.pages ?? Math.ceil(res.total / this.pageSize);
          this.loading = false;
        },
        error: (e) => {
          this.error = e?.error?.message || 'Failed to load inventory';
          this.loading = false;
        },
      });
  }

  onPage(e: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  getProductName(item: InventoryProduct): string {
    return item.product?.name || 'Unknown Product';
  }

  getCategoryName(item: InventoryProduct): string {
    const cat = item.product?.category;
    return typeof cat === 'object' && cat && 'name' in cat ? cat.name : '—';
  }

  getBranchName(item: InventoryProduct): string {
    const branch = item.branch;
    return typeof branch === 'object' && branch && 'name' in branch ? branch.name : '—';
  }

  getStockStatus(quantity: number): string {
    if (quantity <= 0) return 'bg-red-100 text-red-800';
    if (quantity < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  getStockLabel(quantity: number): string {
    if (quantity <= 0) return 'OUT OF STOCK';
    if (quantity < 10) return 'LOW STOCK';
    return 'IN STOCK';
  }
}
