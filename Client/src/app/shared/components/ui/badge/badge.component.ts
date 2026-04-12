import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

@Component({
  selector: 'span[appBadge]',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';

  @HostBinding('class')
  get badgeClasses(): string {
    const baseClasses =
      'inline-flex items-center rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

    const variantClasses = {
      default: 'bg-primary/15 text-primary',
      secondary: 'bg-muted text-muted-foreground',
      destructive: 'bg-destructive/15 text-destructive',
      outline: 'border border-border bg-background text-foreground',
    }[this.variant];

    return `${baseClasses} ${variantClasses}`;
  }
}
