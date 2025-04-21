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
    try {
      console.log('Starting remote modules initialization');
      
      // First, add fallback configurations in case remote fetch fails
      // This now includes dynamic route discovery
      await this.addDefaultConfigurations();
      
      // Fetch manifests from all registered remotes
      const fetchResults = await firstValueFrom(this.fetchAllRemoteManifests());
      
      if (fetchResults && fetchResults.length > 0) {
        // Update module registry with fetched configurations from manifests
        fetchResults.forEach(result => {
          if (result.success && result.manifest) {
            const { remoteName, baseUrl, manifest } = result;
            console.log(`Updating configuration for ${remoteName} from manifest`);
            
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
   * Add default configurations as fallback - with dynamic route discovery
   */
  private async addDefaultConfigurations(): Promise<void> {
    console.log('Setting up default configurations with dynamic route discovery');
    
    // Process each remote app in the registry
    for (const remote of this.remoteRegistry) {
      try {
        // Try to load the manifest.json directly first
        const manifestUrl = `${remote.baseUrl}/assets/manifest.json`;
        console.log(`Attempting to load manifest from: ${manifestUrl}`);
        
        // Use the HttpClient to fetch the manifest
        const manifest = await firstValueFrom(
          this.http.get<RemoteManifest>(manifestUrl).pipe(
            catchError(error => {
              console.warn(`Could not load manifest for ${remote.name} from ${manifestUrl}`, error);
              return of(null);
            })
          )
        );

        if (manifest) {
          // Successfully loaded the manifest
          console.log(`Loaded manifest for ${remote.name}:`, manifest);
          
          this.addRemoteModule(remote.name, {
            remoteEntry: `${remote.baseUrl}/remoteEntry.js`,
            remoteName: manifest.remoteName || remote.name,
            exposedModule: manifest.exposedModule || './Routes',
            displayName: manifest.displayName || this.formatDisplayName(remote.name),
            routePath: manifest.routePath || remote.name,
            version: manifest.version
          });
        } else {
          // Fall back to default naming conventions if manifest loading fails
          console.log(`Falling back to default configuration for ${remote.name}`);
          
          // Apply naming conventions based on the remote name
          let routePath = remote.name;
          let displayName = this.formatDisplayName(remote.name);
          
          // Special case handling for known remotes
          if (remote.name === 'patient-records') {
            routePath = 'patients';
            displayName = 'Patient Records';
          } else if (remote.name === 'appointment-scheduling') {
            routePath = 'appointments';
            displayName = 'Appointment Scheduling';
          }
          
          this.addRemoteModule(remote.name, {
            remoteEntry: `${remote.baseUrl}/remoteEntry.js`,
            remoteName: remote.name,
            exposedModule: './Routes',
            displayName: displayName,
            routePath: routePath
          });
        }
      } catch (error) {
        console.error(`Error setting up default configuration for ${remote.name}:`, error);
        
        // Add basic fallback configuration
        this.addRemoteModule(remote.name, {
          remoteEntry: `${remote.baseUrl}/remoteEntry.js`,
          remoteName: remote.name,
          exposedModule: './Routes',
          displayName: this.formatDisplayName(remote.name),
          routePath: remote.name
        });
      }
    }
  }
  
  /**
   * Format a technical name into a display name
   */
  private formatDisplayName(name: string): string {
    // Convert camelCase or kebab-case to Title Case with spaces
    return name
      .replace(/-/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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