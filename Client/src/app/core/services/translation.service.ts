import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly fallbackLang = 'en';

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.init();
  }

  private init() {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang(this.fallbackLang);
    
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('language') || this.fallbackLang;
      this.useLanguage(savedLang);
    } else {
      this.useLanguage(this.fallbackLang);
    }
  }

  useLanguage(lang: string) {
    this.translate.use(lang).subscribe();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }

  getCurrentLanguage(): string {
    return this.translate.getCurrentLang() || this.fallbackLang;
  }
}
