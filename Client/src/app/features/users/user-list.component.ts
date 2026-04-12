import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { UserAdminService } from './user.service';
import { BranchService, Branch } from '../branches/branch.service';
import { ButtonComponent, CardComponent, InputComponent, BadgeComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-user-list',
  imports: [
    AsyncPipe,
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    BadgeComponent,
    TranslateModule,
  ],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private readonly api = inject(UserAdminService);
  private readonly branchApi = inject(BranchService);
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  data: import('../../core/models/user.model').User[] = [];
  branches: Branch[] = [];
  loading = false;
  error: string | null = null;
  total = 0;
  totalPages = 1;
  pageIndex = 0;
  pageSize = 10;
  Math = Math;

  createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    role: ['cashier' as UserRole, Validators.required],
    branch: [''],
  });

  ngOnInit(): void {
    this.load();
    this.loadBranches();

    this.auth.user$.subscribe(user => {
      if (user?.role === 'manager') {
        this.createForm.controls.branch.addValidators(Validators.required);
        this.createForm.controls.branch.updateValueAndValidity();
      }
    });
  }

  loadBranches(): void {
    const req = this.auth.user?.role === 'manager' ? this.branchApi.listMine() : this.branchApi.list();
    req.subscribe({
      next: (res) => {
        this.branches = res.data.branches;
      }
    });
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const req =
      this.auth.user?.role === 'manager'
        ? this.api.listByManager({ page: this.pageIndex + 1, limit: this.pageSize })
        : this.api.list({ page: this.pageIndex + 1, limit: this.pageSize });
    req.subscribe({
      next: (res) => {
        this.data = res.data.users;
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

  getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      admin: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200',
      manager: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200',
      cashier: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    };
    return colors[role];
  }

  create(): void {
    const v = this.createForm.getRawValue();
    if (v.password !== v.confirmPassword) {
      alert('Passwords must match');
      return;
    }
    this.api
      .create({
        name: v.name,
        email: v.email,
        password: v.password,
        confirmPassword: v.confirmPassword,
        role: this.auth.user?.role === 'admin' ? v.role : undefined,
        branch: v.branch || undefined,
      })
      .subscribe({
        next: () => {
          this.createForm.reset({ role: 'cashier' });
          this.load();
        },
        error: () => {},
      });
  }

  remove(id: string): void {
    if (!confirm('Delete user?')) {
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
