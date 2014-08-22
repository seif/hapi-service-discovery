var service = require('./lib/service'),
    config = {};

exports.register = function(plugin, options, next){
  config = options;

  plugin.log(["discovery"], "registering discovery routes");
  plugin.route([
    {
      method: "GET",
      path: "/discovery/announce",
      config: {
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
        handler: function(request, reply){
          reply({ lastUpdate: service.lastUpdate().toISOString() });
        }
      }
    }
  ]);

  service.init(plugin, config, function(){
    next();
  });
};

exports.register.attributes = {
  pkg: require('./package.json')
};
