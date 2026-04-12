import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

const STORAGE_KEY = 'inventory_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  init(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.setDark(prefersDark);
  }

  toggle(): void {
    const next = this.doc.documentElement.getAttribute('data-theme') !== 'dark';
    this.setDark(next);
  }

  setDark(dark: boolean): void {
    this.doc.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }

  isDark(): boolean {
    return this.doc.documentElement.getAttribute('data-theme') === 'dark';
  }
}
