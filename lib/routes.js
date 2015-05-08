var service = require("./service");

module.exports = function(options){
  return [
    {
      method: "GET",
      path: "/discovery/announce",
      config: {
        auth: options.discoveryRoutesAuth,
        handler: function(request, reply){
          service.announce(function(err){
            return reply(err);
          });
        },
        tags: ['discovery', 'non-cacheable'],
        description: 'announce this instance'
      }
    },
    {
      method: "GET",
      path: "/discovery/unannounce",
      config: {
        auth: options.discoveryRoutesAuth,
        handler: function(request, reply){
          service.unannounce(function(err){
            return reply(err);
          });
        },
        tags: ['discovery', 'non-cacheable'],
        description: 'unannounce this instance'
      }
    },
    {
      method: "GET",
      path: "/discovery/lease",
      config: {
        auth: options.discoveryRoutesAuth,
        handler: function(request, reply){
          var lease = service.lease();
          if(!lease){
            return reply().code(404);
          }

          return reply(lease);
        },
        tags: ['discovery', 'non-cacheable'],
        description: 'view the lease information obtained from the announce call'
      }
    },
    {
      method: "GET",
      path: "/discovery/lastUpdate",
      config: {
        auth: options.discoveryRoutesAuth,
        handler: function(request, reply){
          reply({ lastUpdate: service.lastUpdate().toISOString() });
        },
        tags: ['discovery', 'non-cacheable'],
        description: 'the last time a discovery update was successfully retrieved'
      }
    }
  ];
};
