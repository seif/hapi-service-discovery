hapi-service-discovery
---

Plugin for hapi to wrap announce/unannounce functionality

Connects the discovery client, exposes routes for announce, unannounce (so that you can control the server externally), and wraps the logging to server.log

Currently depends on some closed-source modules which we are in the process of open-sourcing


Usage:

```

var server = hapi.createServer();

server.pack.register({
  plugin: require('hapi-service-discovery'),
  options: {
    host: 'my-discovery-server.com',
    serviceType: 'my-service',
    serviceUri: 'http://my-service.domain.com'
  }
});

server.start(function(){
  server.log(["info"], "server started...");

  server.plugins['hapi-service-discovery'].announce(function(err){
      if(err){
        throw err;
      }

      server.log(["info"], "announced");
    })
});

```

The plugin exposes the following methods from the ot-discovery module:

```

- announce(callback)
- unannounce(lease, callback)
- find(serviceType | predicate )
- findAll(serviceType | predicate)

```

Routes:

```

GET /discovery/announce    - announce this server to the registry
GET /discovery/unannounce  - unannounce this server
GET /discovery/lease       - show lease info
GET /discovery/lastUpdated - show last time the client received an update from the remote discovery service (useful for monitoring)

```

Logging: Will log using 'plugin.log()' and the tag "discovery"
