import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import {
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
  PreloadAllModules
} from '@angular/router';

import { routes } from './app.routes';
import { ThemeService } from './core/services/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,

      // Baixa em segundo plano o código de todas as páginas logo após o app
      // abrir. Sem isso, o primeiro clique em cada aba espera o download,
      // e é isso que dá a sensação de "trava" antes de a página aparecer.
      withPreloading(PreloadAllModules),

      // Cada página nova começa no topo.
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),

    // Instancia o ThemeService assim que o app inicia, em qualquer rota,
    // para o tema salvo ser sempre restaurado.
    provideAppInitializer(() => {
      inject(ThemeService);
    })
  ]
};