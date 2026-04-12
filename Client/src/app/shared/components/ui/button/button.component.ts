import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'approve' | 'cancel' | 'add';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="!loading">
      <ng-content></ng-content>
    </ng-container>
    <div *ngIf="loading" class="flex items-center gap-2">
      <svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="opacity-80">Please wait...</span>
    </div>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'default';
  @Input() disabled = false;
  @Input() loading = false;

  @HostBinding('disabled')
  get isDisabled(): boolean {
    return this.disabled;
  }

  @HostBinding('class')
  get buttonClasses(): string {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

    const loadingClasses = this.loading ? 'pointer-events-none opacity-80' : '';

    const variantClasses = {
      default: 'bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:bg-primary/90 hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]',
      destructive: 'bg-transparent text-[#EF4444] border border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#FCA5A5] active:bg-[#FEE2E2] active:scale-[0.97]',
      approve: 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300 shadow-[0_2px_8px_rgba(16,185,129,0.12)] hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-800 active:scale-[0.97]',
      cancel: 'bg-violet-50 text-violet-700 border-2 border-violet-300 shadow-[0_2px_8px_rgba(139,92,246,0.12)] hover:bg-violet-100 hover:border-violet-400 hover:text-violet-800 active:scale-[0.97]',
      add: 'bg-[#3B82F6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:bg-[#2563EB] hover:shadow-[0_6px_16px_rgba(37,99,235,0.35)] active:scale-[0.97] border border-[#2563EB]',
      outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-none',
      ghost: 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900',
      link: 'text-primary underline-offset-4 hover:underline font-bold shadow-none p-0 h-auto',
    }[this.variant as string] || '';

    const sizeClasses = {
      default: 'h-12 px-6 py-3',
      sm: 'rounded-[10px] px-4 py-2 text-[13px]',
      lg: 'h-14 rounded-[1.25rem] px-10 text-base',
      icon: 'h-12 w-12',
    }[this.size as string] || '';

    return `${baseClasses} ${variantClasses} ${sizeClasses} ${loadingClasses}`;
  }
}
