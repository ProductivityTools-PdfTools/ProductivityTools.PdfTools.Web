import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, InjectionToken } from '@angular/core';
// ... existing imports ...
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { firebaseConfig } from './firebase.config';
import { authInterceptor } from './auth/auth.interceptor';
import { AuthService } from './auth/auth.service';

export const API_URL = new InjectionToken<string>('API_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    {
      provide: API_URL,
      useValue: isDevMode()
        ? 'http://localhost:8080/api/'
        : 'https://pt-pdf-tools-api-93484780890.europe-west1.run.app/api/'
    }
  ]
};
