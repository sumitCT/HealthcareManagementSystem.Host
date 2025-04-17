const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');



module.exports = withModuleFederationPlugin({

  remotes: {
    "patient-records": "http://localhost:4201/remoteEntry.js",
    "demographics": "http://localhost:4203/remoteEntry.js",
    "appointment-scheduling": "http://localhost:4202/remoteEntry.js",
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});
