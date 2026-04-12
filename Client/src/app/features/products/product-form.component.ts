import { AsyncPipe, CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../categories/category.service';
import { ProductService } from './product.service';
import { InputComponent } from '../../shared/components/ui';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { CardComponent } from '../../shared/components/ui/card/card.component';

@Component({
  standalone: true,
  selector: 'app-product-form',
  imports: [
    AsyncPipe,
    CommonModule,
    CurrencyPipe,
    DecimalPipe,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    CardComponent,
    MatSnackBarModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsApi = inject(ProductService);
  private readonly categoriesApi = inject(CategoryService);
  private readonly snack = inject(MatSnackBar);

  readonly categories$ = this.categoriesApi.list();

  isEdit = false;
  productId: string | null = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  currentStep = 1;

  readonly detailsForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.isEdit = this.route.snapshot.routeConfig?.path === ':id/edit';
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.isEdit && this.productId) {
      this.loading = true;
      this.productsApi.getById(this.productId).subscribe({
        next: (res) => {
          const p = res.data.product;
          const catId =
            typeof p.category === 'object' && p.category && '_id' in p.category
              ? p.category._id
              : p.category;
          this.detailsForm.patchValue({
            name: p.name,
            description: p.description,
            price: p.price,
            category: typeof catId === 'string' ? catId : '',
          });
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          void this.router.navigate(['/products']);
        },
      });
    }
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }
    this.currentStep = Math.min(this.currentStep + 1, 3);
  }

  prevStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  onFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imageFile = file;
    this.imagePreview = URL.createObjectURL(file);
  }

  submit(): void {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      this.currentStep = 1;
      return;
    }
    const v = this.detailsForm.getRawValue();
    const fd = new FormData();
    fd.append('name', v.name);
    fd.append('description', v.description);
    fd.append('price', String(v.price));
    fd.append('category', v.category);
    if (this.imageFile) {
      fd.append('image', this.imageFile, this.imageFile.name);
    }

    if (!this.isEdit) {
      if (!this.imageFile) {
        this.snack.open('Product image is required for new products.', 'Dismiss', { duration: 6000 });
        this.currentStep = 2;
        return;
      }
      this.productsApi.create(fd).subscribe({
        next: (res) => void this.router.navigate(['/products', res.data.product._id]),
        error: (e) =>
          this.snack.open(e?.error?.message || 'Create failed', 'Dismiss', { duration: 7000 }),
      });
    } else if (this.productId) {
      this.productsApi.update(this.productId, fd).subscribe({
        next: (res) => void this.router.navigate(['/products', res.data.product._id]),
        error: (e) =>
          this.snack.open(e?.error?.message || 'Update failed', 'Dismiss', { duration: 7000 }),
      });
    }
  }
}
