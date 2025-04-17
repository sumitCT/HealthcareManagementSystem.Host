import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'patients',
    loadChildren: () => import('patient-records/Routes').then((m) => m.routes),
  },
  {
    path: 'demographics',
    loadChildren: () => import('demographics/Routes').then((m) => m.routes),
  },
  {
    path: 'appointments',
    loadChildren: () =>
      import('appointment-scheduling/Routes').then((m) => m.routes),
  },
];
