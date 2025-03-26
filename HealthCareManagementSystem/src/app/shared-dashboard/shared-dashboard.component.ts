import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-shared-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './shared-dashboard.component.html',
  styleUrl: './shared-dashboard.component.scss',
})
export class SharedDashboardComponent implements OnInit {
  @ViewChild('patientRecordsContainer', {
    read: ViewContainerRef,
    static: true,
  })
  patientRecordsContainer!: ViewContainerRef;

  @ViewChild('appointmentSchedulingContainer', {
    read: ViewContainerRef,
    static: true,
  })
  appointmentSchedulingContainer!: ViewContainerRef;

  constructor(private cfr: ComponentFactoryResolver) {}

  async ngOnInit() {
    // Dynamically load Patient Records component
    const patientRecordsModule = await import('PatientRecords/Module');
    const patientRecordsComponent = patientRecordsModule.RemoteEntryComponent;
    const patientRecordsFactory = this.cfr.resolveComponentFactory(
      patientRecordsComponent
    );
    this.patientRecordsContainer.createComponent(patientRecordsFactory);

    // Dynamically load Appointment Scheduling component
    const appointmentSchedulingModule = await import(
      'AppointmentScheduling/Module'
    );
    const appointmentSchedulingComponent =
      appointmentSchedulingModule.RemoteEntryComponent;
    const appointmentSchedulingFactory = this.cfr.resolveComponentFactory(
      appointmentSchedulingComponent
    );
    this.appointmentSchedulingContainer.createComponent(
      appointmentSchedulingFactory
    );
  }
}
