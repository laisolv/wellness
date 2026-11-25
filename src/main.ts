import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Bloqueia o pinch-to-zoom no iOS Safari
document.addEventListener('gesturestart', (e) => e.preventDefault());

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));