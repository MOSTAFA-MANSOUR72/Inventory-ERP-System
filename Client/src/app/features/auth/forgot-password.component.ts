import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { HttpContext } from '@angular/common/http';
import { SKIP_AUTH } from '../../core/http/http-context';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, CardComponent, InputComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    TranslateModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly snack = inject(MatSnackBar);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submitting = false;
  sent = false;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const email = this.form.controls.email.value;
    this.http
      .post<{ status: string; message: string }>(
        `${environment.apiUrl}/forgotPassword`,
        { email },
        { context: new HttpContext().set(SKIP_AUTH, true) }
      )
      .subscribe({
        next: (res) => {
          this.sent = true;
          this.snack.open(res.message || 'Check your email.', 'Dismiss', { duration: 8000 });
        },
        error: (err: { error?: { message?: string } }) => {
          this.snack.open(err?.error?.message || 'Request failed.', 'Dismiss', { duration: 7000 });
        },
        complete: () => {
          this.submitting = false;
        },
      });
  }
}
