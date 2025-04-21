import { Routes } from '@angular/router';
import { RemoteConfig } from './remote-modules.service';
import { loadRemoteModule } from '@angular-architects/module-federation';

// Base routes that will always be available
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  }
];

// Function to build routes from remote module configs
export function buildRoutes(remotes: RemoteConfig[]): Routes {
  const dynamicRoutes: Routes = [
    {
      path: '',
      loadComponent: () =>
        import('./home/home.component').then((m) => m.HomeComponent),
    }
  ];

  // Add dynamic routes from remote modules
  for (const remote of remotes) {
    // Log the route being added for debugging
    console.log(`Adding route for path: ${remote.routePath}, remoteEntry: ${remote.remoteEntry}`);
    
    dynamicRoutes.push({
      path: remote.routePath,
      loadChildren: () => 
        loadRemoteModule({
          type: 'module',
          remoteEntry: remote.remoteEntry,
          exposedModule: remote.exposedModule
        })
        .then(m => {
          console.log(`Successfully loaded remote module for ${remote.routePath}`);
          return m.routes;
        })
        .catch(err => {
          console.error(`Failed to load remote module for ${remote.routePath}:`, err);
          throw err;
        })
    });
  }

  return dynamicRoutes;
}
