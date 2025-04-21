import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes, buildRoutes } from './app.routes';
import { RemoteModulesService } from './remote-modules.service';
import { APP_INITIALIZER } from '@angular/core';

export function initializeApp(remoteModulesService: RemoteModulesService) {
  return () => {
    // You could fetch remote module configurations from an API here
    // e.g., return fetch('/api/remote-modules').then(res => res.json())
    //       .then(modules => modules.forEach(m => remoteModulesService.addRemoteModule(m.key, m)));
    return Promise.resolve(); // For now, just return a resolved promise
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    RemoteModulesService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [RemoteModulesService],
      multi: true
    },
    {
      provide: 'APP_ROUTES',
      useFactory: (remoteModulesService: RemoteModulesService) => {
        const remotes = remoteModulesService.getRemoteModulesList();
        return buildRoutes(remotes);
      },
      deps: [RemoteModulesService]
    },
    // Fix: Call the function first to get the routes, then pass the routes to provideRouter
    provideRouter(buildRoutes(new RemoteModulesService().getRemoteModulesList()))
  ]
};
