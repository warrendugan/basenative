import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { appRoutes } from './app/app.routes';
import { appConfig } from './app/app.config';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrapApplication(App, {
  providers: [
    provideRouter(appRoutes),
    ...appConfig.providers,
  ],
});
