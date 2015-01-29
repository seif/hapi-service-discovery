#Hapi-service-discovery
[![Build Status](https://travis-ci.org/opentable/hapi-service-discovery.png?branch=master)](https://travis-ci.org/opentable/hapi-service-discovery) [![NPM version](https://badge.fury.io/js/hapi-service-discovery.png)](http://badge.fury.io/js/hapi-service-discovery) ![Dependencies](https://david-dm.org/opentable/hapi-service-discovery.png)

Hapi Plugin for opentable-flavoured service-discovery 

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
    serviceUri: 'http://my-service.domain.com', // Defaults to the machine's FQDN,
    discoveryRoutesAuth: false, // optional, default behaviour is to inherit the route default, can either be false (to disable auth) or the name of an auth strategy (to override the route default).
    metadata: { // metadata is optional
      domain: 'com'
    }, 
    onError: function(err) {
      // optional error handler
      // when set, forces initialisation to continue when any runtime errors are encountered
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
