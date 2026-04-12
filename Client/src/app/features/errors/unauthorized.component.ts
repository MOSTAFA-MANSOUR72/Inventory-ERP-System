import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-unauthorized',
  imports: [MatCardModule, MatButtonModule, RouterLink],
  template: `
    <div class="wrap">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Sign in required</mat-card-title>
          <mat-card-subtitle>You need an active session to view this page.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions align="end">
          <a mat-button routerLink="/auth/login">Go to sign in</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      mat-card {
        max-width: 420px;
        width: 100%;
      }
    `,
  ],
})
export class UnauthorizedComponent {}
