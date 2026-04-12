import { Component, OnDestroy, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="crumbs" aria-label="Breadcrumb">
      @for (c of crumbs; track c.url; let last = $last) {
        @if (!last) {
          <a [routerLink]="c.url">{{ c.label }}</a>
          <span class="sep" aria-hidden="true">/</span>
        } @else {
          <span class="current">{{ c.label }}</span>
        }
      }
    </nav>
  `,
  styles: [
    `
      .crumbs {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.54);
      }
      :host-context([data-theme='dark']) .crumbs {
        color: rgba(255, 255, 255, 0.6);
      }
      a {
        color: var(--mat-primary-default, #368396);
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      .current {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }
      :host-context([data-theme='dark']) .current {
        color: rgba(255, 255, 255, 0.87);
      }
      .sep {
        user-select: none;
      }
    `,
  ],
})
export class BreadcrumbComponent implements OnDestroy {
  private readonly router = inject(Router);
  private sub: Subscription;

  crumbs: { label: string; url: string }[] = [];

  constructor() {
    this.rebuild();
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.rebuild());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private rebuild(): void {
    const out: { label: string; url: string }[] = [];
    let route = this.router.routerState.snapshot.root;
    const segments: string[] = [];
    while (route.firstChild) {
      route = route.firstChild;
      for (const u of route.url) {
        segments.push(u.path);
      }
      const b = route.data['breadcrumb'] as string | undefined;
      if (b) {
        out.push({
          label: b,
          url: '/' + segments.join('/'),
        });
      }
    }
    this.crumbs = out;
  }
}
