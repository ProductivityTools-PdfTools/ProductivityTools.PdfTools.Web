import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpHeaders, withInterceptors, withFetch } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { extractFiles } from 'extract-files';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { firebaseConfig } from './firebase.config';
import { authInterceptor } from './auth/auth.interceptor';
import { AuthService } from './auth/auth.service';

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
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const authService = inject(AuthService);

      const basic = httpLink.create({
        uri: isDevMode() ? 'http://localhost:8080/graphql' : 'https://pt-pdf-tools-api-93484780890.europe-west1.run.app/graphql',
        extractFiles,
        useMultipart: true,
        headers: new HttpHeaders({
          'Accept': 'application/json',
        })
      });

      const auth = setContext((operation, context) => {
        const token = authService.getToken();
        return {
          headers: new HttpHeaders().set('Authorization', token ? `Bearer ${token}` : '')
        };
      });

      return {
        link: ApolloLink.from([auth, basic]),
        cache: new InMemoryCache(),
      };
    }),
  ]
};
