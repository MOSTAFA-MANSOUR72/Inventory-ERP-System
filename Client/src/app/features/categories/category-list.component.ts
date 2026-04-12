import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { CategoryService } from './category.service';
import { ButtonComponent, CardComponent, InputComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-category-list',
  imports: [
    AsyncPipe,
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    TranslateModule,
  ],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit {
  private readonly api = inject(CategoryService);
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  data: { _id: string; name: string }[] = [];
  loading = false;
  error: string | null = null;
  total = 0;
  totalPages = 1;
  pageIndex = 0;
  pageSize = 10;
  Math = Math;

  createForm = this.fb.nonNullable.group({ name: ['', Validators.required] });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.list({ page: this.pageIndex + 1, limit: this.pageSize }).subscribe({
      next: (res) => {
        this.data = res.data.categories;
        this.total = res.total;
        this.totalPages = res.pages ?? Math.ceil(res.total / this.pageSize);
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Failed to load';
        this.loading = false;
      },
    });
  }

  isAdmin(role: UserRole | undefined): boolean {
    return role === 'admin';
  }

  create(): void {
    if (this.createForm.invalid) {
      return;
    }
    const name = this.createForm.get('name')?.value;
    if (!name) return;

    this.api.create({ name }).subscribe({
      next: () => {
        this.createForm.reset();
        this.load();
      },
      error: () => {},
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this category?')) {
      return;
    }
    this.api.delete(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {},
    });
  }

  onPage(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }
}
