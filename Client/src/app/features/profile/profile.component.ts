import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { roleLabel } from '../../core/constants/roles';
import { matchField } from '../../shared/validators/app-validators';
import { InputComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [
    AsyncPipe,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    InputComponent,
    MatSnackBarModule,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  roleLabel = roleLabel;

  pwdForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPasswordConfirm: ['', [Validators.required, matchField('newPassword')]],
  });

  ngOnInit(): void {
    if (!this.auth.user) {
      void this.auth.loadMe().subscribe();
    }
  }

  updatePassword(): void {
    if (this.pwdForm.invalid) {
      this.pwdForm.markAllAsTouched();
      return;
    }
    const v = this.pwdForm.getRawValue();
    this.auth
      .updatePassword({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
        newPasswordConfirm: v.newPasswordConfirm,
      })
      .subscribe({
        next: () => {
          this.pwdForm.reset();
          this.snack.open('Password updated', 'OK', { duration: 4000 });
        },
        error: (e: { error?: { message?: string } }) =>
          this.snack.open(e?.error?.message || 'Update failed', 'OK', { duration: 6000 }),
      });
  }
}
