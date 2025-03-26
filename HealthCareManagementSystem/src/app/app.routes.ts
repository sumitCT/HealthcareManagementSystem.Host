import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedDashboardComponent } from './shared-dashboard/shared-dashboard.component';

export const routes: Routes = [ // Export the routes constant
  {
    path: 'shared-dashboard',
    component: SharedDashboardComponent,
  },
  {
    path: 'patient-records',
    loadChildren: () =>
      import('PatientRecords/Module').then((m) => m.RemoteEntryModule),
  },
  {
    path: 'appointment-scheduling',
    loadChildren: () =>
      import('AppointmentScheduling/Module').then((m) => m.RemoteEntryModule),
  },
  { path: '', redirectTo: 'shared-dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}