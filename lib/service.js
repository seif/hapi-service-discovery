var fqdn = require("FQDN"),
    fs = require("fs"),
    discovery = require("ot-discovery"),
    config, lastUpdate, disco, lease, FQDN;

module.exports.init = function(server, options, done){
  config = options;

  disco = new discovery(config.host,
    {
      logger: {
        log: function(log){
          server.log(["discovery"], log);
        },
        error: function(err){
          server.log(["discovery", "error"], err);
        }
      }
    }
  );

  disco.connect(function(err, host, servers){
    if(err){
      throw err;
    }
    server.log(["discovery"], "discovery initialised");
    lastUpdate = new Date();

    disco.onUpdate(function(data){
      lastUpdate = new Date();
    });

    fqdn(function(err, res){
      if(err){
        throw err;
      }

      FQDN = res;
      done();
    });
  });
};

module.exports.announce = function(done){

  if(lease){
    return done();
  }

  disco.announce({
    serviceType: config.serviceType,
    serviceUri: (config.https ? "https": "http") + "://" + FQDN
  }, function(err, res){
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

module.exports.lease = function(){ return lease; };
module.exports.lastUpdate = function(){ return lastUpdate; };
