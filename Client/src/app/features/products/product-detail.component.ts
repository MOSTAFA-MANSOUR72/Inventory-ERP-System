import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { assetUrl } from '../../core/utils/asset-url';
import { PageStateComponent } from '../../shared/components/page-state/page-state.component';
import { ProductService } from './product.service';

import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { CardComponent } from '../../shared/components/ui/card/card.component';

@Component({
  standalone: true,
  selector: 'app-product-detail',
  imports: [AsyncPipe, CommonModule, RouterLink, PageStateComponent, ButtonComponent, CardComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductService);
  readonly auth = inject(AuthService);

  assetUrl = assetUrl;
  loading = true;
  error: string | null = null;
  product: import('./product.service').Product | null = null;

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
    this.error = null;
    this.productsApi.getById(id).subscribe({
      next: (res) => {
        this.product = res.data.product;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Failed to load';
        this.loading = false;
      },
    });
  }

  canManage(role: UserRole | undefined): boolean {
    return role === 'admin' || role === 'manager';
  }

  categoryName(): string {
    const c = this.product?.category;
    return typeof c === 'object' && c && 'name' in c ? c.name : '—';
  }
}
