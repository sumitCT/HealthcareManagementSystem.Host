import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RemoteModulesService, RemoteConfig } from '../remote-modules.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  remoteModules: RemoteConfig[] = [];

  constructor(private remoteModulesService: RemoteModulesService) {}

  ngOnInit(): void {
    this.remoteModules = this.remoteModulesService.getRemoteModulesList();
  }
}
