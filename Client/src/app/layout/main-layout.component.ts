import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { TranslationService } from '../core/services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { UserRole } from '../core/models/user.model';
import { roleLabel } from '../core/constants/roles';
import { BreadcrumbComponent } from '../shared/components/breadcrumb/breadcrumb.component';
import { ButtonComponent, BadgeComponent, AvatarComponent, AvatarImageComponent, AvatarFallbackComponent } from '../shared/components/ui';
import { ClickOutsideDirective } from '../shared/directives/click-outside.directive';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    FormsModule,
    TranslateModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BreadcrumbComponent,
    ButtonComponent,
    BadgeComponent,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent,
    ClickOutsideDirective,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  readonly translationService = inject(TranslationService);

  readonly user$ = this.auth.user$;
  readonly roleLabel = roleLabel;

  sidenavOpen = true;
  searchQuery = '';
  userMenuOpen = false;

  logout(): void {
    this.auth.logout();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleLanguage(): void {
    const newLang = this.translationService.getCurrentLanguage() === 'ar' ? 'en' : 'ar';
    this.translationService.useLanguage(newLang);
  }

  canSee(role: UserRole | undefined, allowed: UserRole[]): boolean {
    return !!role && allowed.includes(role);
  }

  readonly roles = {
    adminOnly: ['admin'] as UserRole[],
    adminManager: ['admin', 'manager'] as UserRole[],
    cashierOnly: ['cashier'] as UserRole[],
    notCashier: ['admin', 'manager'] as UserRole[],
    all: ['admin', 'manager', 'cashier'] as UserRole[],
  };

  globalSearch(): void {
    const term = this.searchQuery.trim();
    if (!term) {
      return;
    }
    void this.router.navigate(['/products'], { queryParams: { search: term } });
    this.searchQuery = '';
  }

  toggleSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }
}
