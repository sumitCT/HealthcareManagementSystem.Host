import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes, buildRoutes } from './app.routes';
import { RemoteModulesService } from './remote-modules.service';
import { APP_INITIALIZER, Injector } from '@angular/core';

export function initializeApp(remoteModulesService: RemoteModulesService, router: Router) {
  return async () => {
    // Initialize remote modules by fetching manifests from the remote apps
    await remoteModulesService.initializeRemoteModules();
    
    // Get the dynamic routes after initialization
    const dynamicRoutes = buildRoutes(remoteModulesService.getRemoteModulesList());
    
    // Reset the router config with the dynamic routes
    router.resetConfig(dynamicRoutes);
    
    console.log('Router configuration updated with dynamic routes:', dynamicRoutes);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideHttpClient(),
    provideRouter(routes), // Start with basic routes
    RemoteModulesService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [RemoteModulesService, Router],
      multi: true
    }
  ]
};
