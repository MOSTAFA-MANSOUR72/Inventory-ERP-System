import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { ProviderService } from './provider.service';
import { ButtonComponent, CardComponent, InputComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-provider-list',
  imports: [
    AsyncPipe,
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    TranslateModule,
  ],
  templateUrl: './provider-list.component.html',
})
export class ProviderListComponent implements OnInit {
  private readonly api = inject(ProviderService);
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  data: { _id: string; name: string; email: string; phone: string }[] = [];
  loading = false;
  error: string | null = null;
  total = 0;
  totalPages = 1;
  pageIndex = 0;
  pageSize = 10;
  Math = Math;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.list({ page: this.pageIndex + 1, limit: this.pageSize }).subscribe({
      next: (res) => {
        this.data = res.data.providers;
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

  isManager(role: UserRole | undefined): boolean {
    return role === 'manager';
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }
    this.api.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset();
        this.load();
      },
      error: () => {},
    });
  }

  remove(id: string): void {
    if (!confirm('Delete supplier?')) {
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
