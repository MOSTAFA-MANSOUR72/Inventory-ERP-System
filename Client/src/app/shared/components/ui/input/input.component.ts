import { Directive, HostBinding, Input, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[appInput]',
  standalone: true,
})
export class InputComponent {
  @Input() @HostBinding('attr.type') type = 'text';
  @Input() disabled = false;
  @Input() placeholder = '';

  private readonly el = inject(ElementRef);

  @HostBinding('class')
  get inputClasses(): string {
    const isSelect = this.el.nativeElement.tagName.toLowerCase() === 'select';
    
    // Select-specific styles (custom chevron with slightly muted indigo)
    const selectStyles = isSelect ? 
      "appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%232563eb%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1.25em_1.25em] pr-10" : '';

    return [
      'flex w-full px-4 py-3.5 transition-all duration-200',
      'text-sm font-semibold text-slate-800 placeholder:text-slate-400',
      
      // Soft Surfaces
      'bg-slate-50/50 border-2 border-slate-100 rounded-2xl',
      
      // Focus State (Soft Primary Glow)
      'focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10',
      
      // Disabled State
      'disabled:cursor-not-allowed disabled:bg-slate-100/50 disabled:border-slate-100 disabled:opacity-50',
      
      // File Input Styling
      'file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-primary',
      
      selectStyles
    ].filter(Boolean).join(' ');
  }
}
