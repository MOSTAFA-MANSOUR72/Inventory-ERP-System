import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BranchService } from './branch.service';
import { ButtonComponent, CardComponent, InputComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-branch-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
  ],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.scss', // Ensure this is linked for the grid background
})
export class BranchListComponent implements OnInit {
  private readonly api = inject(BranchService);
  private readonly fb = inject(FormBuilder);

  data: { _id: string; name: string; location: string }[] = [];
  loading = false;
  error: string | null = null;
  total = 0;
  totalPages = 1;
  pageIndex = 0;
  pageSize = 10;
  Math = Math;

  // Track submission state for the loading spinner in the button
  submitting = false;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    location: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null; // Reset error on reload
    this.api.list({ page: this.pageIndex + 1, limit: this.pageSize }).subscribe({
      next: (res) => {
        this.data = res.data.branches;
        this.total = res.total;
        this.totalPages = res.pages ?? Math.ceil(res.total / this.pageSize);
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Failed to load branches';
        this.loading = false;
      },
    });
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.api.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset();
        this.load();
      },
      error: (e) => {
        // You could add a specific error message here for creation failures
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }

  remove(id: string): void {
    // Standard JS confirm works, but matches your logic
    if (!confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    this.api.delete(id).subscribe({
      next: () => {
        this.load();
      },
      error: (e) => {
        // Handle delete error if necessary
      },
    });
  }

  onPage(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }
}
