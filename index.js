var service = require('./lib/service'),
    joi = require('joi'),
    schema = require('./lib/schema'),
    config = {};

exports.register = function(plugin, options, next){
  config = options;
  var validation = joi.validate(options, schema)

  if(validation.error){
    var err = new Error("config validation error")
    err.inner = validation.error
    return next(err);
  }

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

  plugin.expose({
    announce: service.announce,
    unannounce: service.unannounce,
    find: service.find,
    findAll: service.findAll
  });

  service.init(plugin, config, function(){
    next();
  });
};

exports.register.attributes = {
  pkg: require('./package.json')
};
