const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  output: {
    uniqueName: 'healthcareManagementSystem',
    publicPath: 'auto',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'healthcareManagementSystem',
      remotes: {
        PatientRecords: 'patientRecords@http://localhost:4201/remoteEntry.js',
        AppointmentScheduling: 'appointmentScheduling@http://localhost:4202/remoteEntry.js',
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        '@angular/router': { singleton: true, strictVersion: true },
      },
    }),
  ],
};