import { isPlatformBrowser } from '@angular/common';
import { ApplicationConfig, APP_INITIALIZER, PLATFORM_ID, importProvidersFrom, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';


import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

function themeInitFactory(): () => void {
  const theme = inject(ThemeService);
  const platformId = inject(PLATFORM_ID);
  return () => {
    if (isPlatformBrowser(platformId)) {
      theme.init();
    }
  };
}

function authInitFactory(): () => any {
  const auth = inject(AuthService);
  return () => auth.tryRestoreSession();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    importProvidersFrom(MatSnackBarModule),
    provideTranslateService({
      fallbackLang: 'en',
    }),
    provideTranslateHttpLoader({
      prefix: '/assets/i18n/',
      suffix: '.json'
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: themeInitFactory,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: authInitFactory,
      multi: true,
    },
  ],
};
