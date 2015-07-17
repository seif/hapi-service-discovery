var discovery = require("ot-discovery"),
    fqdn = require("fqdn"),
    hoek = require("hoek"),
    logger, config, lastUpdate, disco, lease;

module.exports.init = function(server, options, done){
  config = hoek.applyToDefaults({
    serviceUri: 'http://' + fqdn()
  }, options);

  logger = {
    log: function(tag, log){
      server.log(["discovery", tag], log);
    }
  };

  disco = new discovery(config.host,
    {
      logger: logger
    }
  );

  disco.connect(function(err, host, servers){
    if(err){
      if(config.onError) {
        config.onError(err);
      } else {
        throw err;
      }
    }

    logger.log(["discovery"], "discovery initialised");
    lastUpdate = new Date();

    disco.onUpdate(function(data){
      lastUpdate = new Date();
    });

    done();
  });
};

module.exports.announce = function(done){

  if(lease){
    return done();
  }

  disco.announce({
    serviceType: config.serviceType,
    serviceUri: config.serviceUri,
    metadata: config.metadata
  }, function(err, res){
    logger.log(["discovery"], "discovery announce: " + JSON.stringify(config));
    if(err){
      return done(err);
    }

    lease = res;
    done();
  });
};

module.exports.unannounce = function(done){

  if(!lease){
    return done();
  }

  disco.unannounce(lease, function(){
    lease = null;
    done();
  });
};

module.exports.find = function(predicate){
  return disco.find(predicate);
};

module.exports.findAll = function(predicate){
  return disco.findAll(predicate);
};

module.exports.lease = function(){ return lease; };
module.exports.lastUpdate = function(){ return lastUpdate; };
