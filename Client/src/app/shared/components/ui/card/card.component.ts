import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'div[appCard]',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class CardComponent {
  @HostBinding('class')
  get cardClasses(): string {
    return 'rounded-2xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-slate-900 transition-all duration-300';
  }
}

@Component({
  selector: 'div[appCardHeader]',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class CardHeaderComponent {
  @HostBinding('class')
  get headerClasses(): string {
    return 'flex flex-col space-y-2 p-8 pb-4';
  }
}

@Component({
  selector: 'h3[appCardTitle]',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class CardTitleComponent {
  @HostBinding('class')
  get titleClasses(): string {
    return 'text-3xl font-extrabold leading-none tracking-tight text-slate-900';
  }
}

@Component({
  selector: 'p[appCardDescription]',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class CardDescriptionComponent {
  @HostBinding('class')
  get descriptionClasses(): string {
    return 'text-base font-medium text-slate-400';
  }
}

@Component({
  selector: 'div[appCardContent]',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class CardContentComponent {
  @HostBinding('class')
  get contentClasses(): string {
    return 'p-8 pt-0';
  }
}

@Component({
  selector: 'div[appCardFooter]',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
})
export class CardFooterComponent {
  @HostBinding('class')
  get footerClasses(): string {
    return 'flex items-center p-8 pt-0';
  }
}
