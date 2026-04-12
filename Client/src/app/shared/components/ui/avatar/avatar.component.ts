import { Component, Input, HostBinding, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'div[appAvatar]',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class AvatarComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @HostBinding('class')
  get avatarClasses(): string {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-16 w-16',
    }[this.size];

    return `relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-background ${sizeClasses}`;
  }
}

@Component({
  selector: 'img[appAvatarImage]',
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export class AvatarImageComponent {
  @HostBinding('class')
  get imageClasses(): string {
    return 'aspect-square h-full w-full object-cover';
  }
}

@Component({
  selector: 'span[appAvatarFallback]',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class AvatarFallbackComponent {
  @HostBinding('class')
  get fallbackClasses(): string {
    return 'flex h-full w-full items-center justify-center rounded-full bg-transparent text-sm font-semibold text-primary';
  }
}
