import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-page-state',
  imports: [MatProgressSpinnerModule, MatButtonModule],
  template: `
    @if (loading) {
      <div class="state" role="status" aria-busy="true">
        <mat-spinner diameter="40" />
        <p>{{ loadingText }}</p>
      </div>
    } @else if (error) {
      <div class="state state-error" role="alert">
        <p>{{ error }}</p>
        @if (showRetry) {
          <button mat-stroked-button type="button" (click)="retry.emit()">Retry</button>
        }
      </div>
    } @else if (empty) {
      <div class="state state-muted">
        <p>{{ emptyText }}</p>
      </div>
    } @else {
      <ng-content />
    }
  `,
  styles: [
    `
      .state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 2rem 1rem;
        text-align: center;
      }
      .state-muted {
        color: rgba(0, 0, 0, 0.54);
      }
      :host-context([data-theme='dark']) .state-muted {
        color: rgba(255, 255, 255, 0.5);
      }
      .state-error {
        color: var(--mat-warn-default, #c62828);
      }
    `,
  ],
})
export class PageStateComponent {
  @Input() loading = false;
  @Input() loadingText = 'Loading…';
  @Input() error: string | null = null;
  @Input() empty = false;
  @Input() emptyText = 'No data yet.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
