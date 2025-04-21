import { Injectable } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

export interface RemoteConfig {
  remoteEntry: string;
  remoteName: string;
  exposedModule: string;
  displayName: string;
  routePath: string;
  version?: string;
}

export interface RemoteManifest {
  remoteName: string;
  exposedModule: string;
  displayName: string;
  routePath: string;
  version?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RemoteModulesService {
  // This map will store our remote module configurations
  private remoteModules: Map<string, RemoteConfig> = new Map();
  // Registry of known remote apps and their base URLs
  private remoteRegistry: { name: string, baseUrl: string }[] = [
    { name: 'patient-records', baseUrl: 'http://localhost:4201' },
    { name: 'demographics', baseUrl: 'http://localhost:4203' },
    { name: 'appointment-scheduling', baseUrl: 'http://localhost:4202' }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Initialize the remote modules registry
   * This method fetches manifests from all remote applications
   */
  async initializeRemoteModules(): Promise<void> {
    // First, add fallback configurations in case remote fetch fails
    this.addDefaultConfigurations();
    
    try {
      // Fetch manifests from all registered remotes using firstValueFrom instead of toPromise()
      const fetchResults = await firstValueFrom(this.fetchAllRemoteManifests());
      
      if (fetchResults && fetchResults.length > 0) {
        // Update module registry with fetched configurations
        fetchResults.forEach(result => {
          if (result.success && result.manifest) {
            const { remoteName, baseUrl, manifest } = result;
            this.addRemoteModule(remoteName, {
              remoteEntry: `${baseUrl}/remoteEntry.js`,
              remoteName: manifest.remoteName,
              exposedModule: manifest.exposedModule,
              displayName: manifest.displayName,
              routePath: manifest.routePath,
              version: manifest.version
            });
          }
        });
        
        console.log('Remote modules initialized:', this.getRemoteModulesList());
      }
    } catch (error) {
      console.error('Failed to initialize remote modules:', error);
    }
  }

  /**
   * Add default configurations as fallback
   */
  private addDefaultConfigurations(): void {
    // Add default remote modules as fallback
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

  /**
   * Fetch manifests from all registered remote applications
   */
  private fetchAllRemoteManifests(): Observable<Array<{
    remoteName: string;
    baseUrl: string;
    manifest?: RemoteManifest;
    success: boolean;
  }>> {
    const fetchRequests = this.remoteRegistry.map(remote => {
      return this.fetchRemoteManifest(remote.name, remote.baseUrl).pipe(
        map(manifest => ({ 
          remoteName: remote.name, 
          baseUrl: remote.baseUrl, 
          manifest, 
          success: true 
        })),
        catchError(error => {
          console.warn(`Failed to fetch manifest for ${remote.name}:`, error);
          return of({ 
            remoteName: remote.name, 
            baseUrl: remote.baseUrl, 
            success: false 
          });
        })
      );
    });

    return forkJoin(fetchRequests);
  }

  /**
   * Fetch manifest from a single remote application
   */
  private fetchRemoteManifest(remoteName: string, baseUrl: string): Observable<RemoteManifest> {
    return this.http.get<RemoteManifest>(`${baseUrl}/assets/manifest.json`);
  }

  /**
   * Register a new remote application URL
   */
  registerRemoteApp(name: string, baseUrl: string): void {
    // Check if remote already exists
    const existing = this.remoteRegistry.find(r => r.name === name);
    if (existing) {
      existing.baseUrl = baseUrl;
    } else {
      this.remoteRegistry.push({ name, baseUrl });
    }
    
    // Fetch its manifest
    this.fetchRemoteManifest(name, baseUrl).subscribe(
      manifest => {
        this.addRemoteModule(name, {
          remoteEntry: `${baseUrl}/remoteEntry.js`,
          remoteName: manifest.remoteName,
          exposedModule: manifest.exposedModule,
          displayName: manifest.displayName,
          routePath: manifest.routePath,
          version: manifest.version
        });
      },
      error => console.error(`Failed to fetch manifest for ${name}:`, error)
    );
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