Underwire Plugins
===

**NOTE:** This is a work in progress, a thinking document, nothing more.

  * Implemented via underwire-cup (Common Utilities and Plugins)
  * Dependencies loaded and validated via underwire-dis (Underwire Dependency Injection System)

API
---

```js
// In configuration file

PLUGINS: [
  {
    module: './relative/location | npm module name@version',
    config: {
      ...
    }
  },
  ...
]

// Generic type ideas
PluginType = OneOf('auth', 'server', 'ui', 'datastore');

// Exposed by Plugin
Plugin = {
  type: PluginType, // or
  types: [PluginType, PluginType],
  name: 'mycomponent', // Component Name, used as auth type for auth
  dependencies: { // Optional, instead of using package.json list here to ensure they are properly installed
    name: 'version', // Same as package.json
  },
  routes: [ // Optional
    { // Standard Hapi.js route definition
      public: true, // Default false, determines if the route requires auth if it is available.
      method: 'GET',
      path: '/myplugin', // Will be prefixed with /api as pages should not be served by the server
      handler(req, reply){
        req.plugins['datastore'].get(id, (err, record)=>{
          ...
        });
        ...
      }
    },
    ...
  ],
  widgets: [ // Optional
    {
      name: 'mywidget',
      source: './widgets/mywidget.jsx', // Relative to plugin install path
    },
    ...
  ],
  pages: [ // Optional
    {
      name: 'Display Name', // Optional
      route: '/page/route/{id}', // Translated to React-Route syntax for you
      source: './pages/mypage.jsx', // Relative to plugin install path
    },
    ...
  ],
  register(options, next){ // Optional
    const {
      server, // Hapi.js server instance
      io, // Socket.io instance
      config: // Configuration from config file
    } = options;
    ...do something...
    next(); // Make sure you always call next!
  },
}
```

Order of operations
---

All dependencies are installed or validated as installed.

If there is a datastore plugin it will be loaded first.  There can be only one datastore plugin in the configuration.

If there are any security plugins they will be loaded next.  Their auth type will be automatically attached to all API routes, the web socket, and UI pages.  All routes or pages not marked as public will have all auth types applied to them by default.

The register method's will be called next.  Order is not guaranteed, but will be determined by dependency chart sorting.

All routes are registered with the server.

All widgets are registered with the UI.

UI is compiled and stored to cache.

Server is started and marked as online.
