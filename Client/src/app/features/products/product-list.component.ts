import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { assetUrl } from '../../core/utils/asset-url';
import { CategoryService } from '../categories/category.service';
import { Product, ProductService } from './product.service';
import { ButtonComponent, CardComponent, InputComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [
    CommonModule,
    AsyncPipe,
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    TranslateModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productsApi = inject(ProductService);
  private readonly categoriesApi = inject(CategoryService);
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  data: Product[] = [];
  loading = false;
  error: string | null = null;
  total = 0;
  totalPages = 1;
  pageSize = 10;
  pageIndex = 0;
  categories$ = this.categoriesApi.list();

  searchCtrl = new FormControl('', { nonNullable: true });
  categoryCtrl = new FormControl<string | null>(null);

  assetUrl = assetUrl;
  Math = Math;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((q) => {
      const s = q.get('search');
      if (s) {
        this.searchCtrl.setValue(s, { emitEvent: false });
      }
      this.load();
    });

    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });

    this.categoryCtrl.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });
  }

  canManage(role: UserRole | undefined): boolean {
    return role === 'admin' || role === 'manager';
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.productsApi
      .list({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        search: this.searchCtrl.value.trim() || undefined,
        category: this.categoryCtrl.value || undefined,
      })
      .subscribe({
        next: (res) => {
          this.data = res.data.products;
          this.total = res.total;
          this.totalPages = res.pages ?? Math.ceil(res.total / this.pageSize);
          this.loading = false;
        },
        error: (e) => {
          this.error = e?.error?.message || 'Failed to load products';
          this.loading = false;
        },
      });
  }

  onPage(e: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  categoryName(p: Product): string {
    const c = p.category;
    return typeof c === 'object' && c && 'name' in c ? c.name : '—';
  }
}
