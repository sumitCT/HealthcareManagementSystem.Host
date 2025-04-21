import { Injectable } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';

export interface RemoteConfig {
  remoteEntry: string;
  remoteName: string;
  exposedModule: string;
  displayName: string;
  routePath: string;
}

@Injectable({
  providedIn: 'root'
})
export class RemoteModulesService {
  // This map will store our remote module configurations
  private remoteModules: Map<string, RemoteConfig> = new Map();

  constructor() {
    // Initialize with default remote modules
    this.initializeRemoteModules();
  }

  private initializeRemoteModules(): void {
    // Add default remote modules
    this.addRemoteModule('patient-records', {
      remoteEntry: 'http://localhost:4201/remoteEntry.js',
      remoteName: 'patient-records',
      exposedModule: './Routes',
      displayName: 'Patient Records',
      routePath: 'patients'
    });

    this.addRemoteModule('demographics', {
      remoteEntry: 'http://localhost:4203/remoteEntry.js',
      remoteName: 'demographics',
      exposedModule: './Routes',
      displayName: 'Demographics',
      routePath: 'demographics'
    });

    this.addRemoteModule('appointment-scheduling', {
      remoteEntry: 'http://localhost:4202/remoteEntry.js',
      remoteName: 'appointment-scheduling',
      exposedModule: './Routes',
      displayName: 'Appointment Scheduling',
      routePath: 'appointments'
    });
  }

  addRemoteModule(key: string, config: RemoteConfig): void {
    this.remoteModules.set(key, config);
  }

  getRemoteModules(): Map<string, RemoteConfig> {
    return this.remoteModules;
  }

  getRemoteModulesList(): RemoteConfig[] {
    return Array.from(this.remoteModules.values());
  }

  async loadRemoteModule(key: string): Promise<any> {
    const config = this.remoteModules.get(key);
    if (!config) {
      throw new Error(`Remote module ${key} not found`);
    }

    try {
      return await loadRemoteModule({
        type: 'module',
        remoteEntry: config.remoteEntry,
        exposedModule: config.exposedModule
      });
    } catch (error) {
      console.error(`Failed to load remote module ${key}:`, error);
      throw error;
    }
  }
}