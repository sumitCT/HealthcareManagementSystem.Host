import { Routes } from '@angular/router';
import { RemoteConfig } from './remote-modules.service';
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'patients',
    loadChildren: () => 
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './Routes'
      }).then(m => m.routes)
  },
  {
    path: 'demographics',
    loadChildren: () => 
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4203/remoteEntry.js',
        exposedModule: './Routes'
      }).then(m => m.routes)
  },
  {
    path: 'appointments',
    loadChildren: () => 
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4202/remoteEntry.js',
        exposedModule: './Routes'
      }).then(m => m.routes)
  },
];

// This function will be used to dynamically build routes from the RemoteModulesService
export function buildRoutes(remotes: RemoteConfig[]): Routes {
  const routes: Routes = [
    {
      path: '',
      loadComponent: () =>
        import('./home/home.component').then((m) => m.HomeComponent),
    }
  ];

  // Add dynamic routes from remote modules
  for (const remote of remotes) {
    routes.push({
      path: remote.routePath,
      loadChildren: () => 
        loadRemoteModule({
          type: 'module',
          remoteEntry: remote.remoteEntry,
          exposedModule: remote.exposedModule
        }).then(m => m.routes)
    });
  }

  return routes;
}
