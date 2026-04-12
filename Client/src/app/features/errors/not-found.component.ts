import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-not-found',
  imports: [MatCardModule, MatButtonModule, RouterLink],
  template: `
    <div class="wrap">
      <mat-card>
        <mat-card-header>
          <mat-card-title>404 — Page not found</mat-card-title>
          <mat-card-subtitle>We could not find a route for this URL.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions align="end">
          <a mat-button routerLink="/dashboard">Back to dashboard</a>
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
export class NotFoundComponent {}
