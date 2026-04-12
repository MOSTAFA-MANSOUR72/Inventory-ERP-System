import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Keeping only SnackBar for feedback
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent, CardComponent, InputComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    MatSnackBarModule,
    InputComponent,
    ButtonComponent,
    CardComponent,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(MatSnackBar);

  // Added for the UI toggle
  hidePassword = true;
  submitting = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    const session = this.route.snapshot.queryParamMap.get('session');
    if (session === 'expired') {
      this.snack.open('Your session expired. Please sign in again.', 'Dismiss', { duration: 6000 });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.submitting = false;
        const msg = err?.error?.message || 'Unable to sign in.';
        this.snack.open(msg, 'Dismiss', { duration: 7000 });
      },
      complete: () => {
        this.submitting = false;
      },
    });
  }
}
