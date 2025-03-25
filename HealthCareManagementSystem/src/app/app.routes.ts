import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
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
  { path: '', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}