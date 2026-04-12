import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ' + getStatusClass(label)">
      <ng-content></ng-content>
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() label: string = '';
  @Input() className: string = '';
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending-design':
        return 'bg-[hsl(var(--status-blue))] text-[hsl(var(--status-blue-foreground))]';
      case 'in-design':
        return 'bg-[hsl(var(--status-purple))] text-[hsl(var(--status-purple-foreground))]';
      case 'pending-production':
        return 'bg-[hsl(var(--status-amber))] text-[hsl(var(--status-amber-foreground))]';
      case 'in-production':
        return 'bg-[hsl(var(--status-orange))] text-[hsl(var(--status-orange-foreground))]';
      case 'ready':
        return 'bg-[hsl(var(--status-green))] text-[hsl(var(--status-green-foreground))]';
      case 'delivered':
        return 'bg-[hsl(var(--status-slate))] text-[hsl(var(--status-slate-foreground))]';
      default:
        return this.className || 'bg-secondary text-secondary-foreground';
    }
  }
}
