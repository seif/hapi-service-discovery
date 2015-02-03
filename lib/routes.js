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
            if(err){
                return reply(err);
            }

            reply();
          });
        }
      }
    },
    {
      method: "GET",
      path: "/discovery/unannounce",
      config: {
        auth: options.discoveryRoutesAuth,
        handler: function(request, reply){
          service.unannounce(function(err){
            if(err){
              return reply(err);
            }
            reply();
          });
        }
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

          reply(lease);
        }
      }
    },
    {
      method: "GET",
      path: "/discovery/lastUpdate",
      config: {
        auth: options.discoveryRoutesAuth,
        handler: function(request, reply){
          reply({ lastUpdate: service.lastUpdate().toISOString() });
        }
      }
    }
  ];
};
