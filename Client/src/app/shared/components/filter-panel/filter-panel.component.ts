import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-filter-panel',
  imports: [MatExpansionModule, MatIconModule],
  template: `
    <mat-accordion>
      <mat-expansion-panel [expanded]="expanded">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>filter_list</mat-icon>
            {{ title }}
          </mat-panel-title>
        </mat-expansion-panel-header>
        <ng-content />
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [
    `
      mat-panel-title {
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }
    `,
  ],
})
export class FilterPanelComponent {
  @Input() title = 'Filters';
  @Input() expanded = false;
}
