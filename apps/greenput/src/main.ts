import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrapApplication(App, appConfig);
