describe('tests', function(){
  var should = require('should'),
  proxyquire = require('proxyquire').noCallThru(),
  dummyService = {
    init: function(a, b, c){
      c();
    }
  },
  routes,
  plugin = {
    route: function(r){ routes = r; },
    log: function(){},
    expose: function(){}
  };

  describe('config validation', function(){
    it('should validate the config options', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      p.register(plugin, {}, function(err){
        done(err === undefined ? new Error("expecting an error to be thrown when validating config options") : undefined);
      });
    });

    it('should accept optional fields in the config options', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      p.register(plugin, {
        host: 'someservice.com',
        serviceType: 'myservice',
      }, done);
    });

    it('should only accept a hostname for the host', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      p.register(plugin, {
        host: 'some garba[]ge',
        serviceType: 'myservice',
      }, function(err){
        done(err === undefined ? new Error("expecting an error to be thrown when validating config options") : undefined);
      });
    });

    it('should accept metadata parameter', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      p.register(plugin, {
        host: 'someservice.com',
        serviceType: 'myservice',
        metadata: { }
      }, done);
    });

    it('should not accept a garbage uri for the serviceUri', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      p.register(plugin, {
        host: 'someservice.com',
        serviceType: 'myservice',
        serviceUri: 'garbage[]s]dfwew'
      }, function(err){
        done(err === undefined ? new Error("expecting an error to be thrown when validating config options") : undefined);
      });
    });

    it('should accept a http uri for the serviceUri', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      p.register(plugin, {
        host: 'someservice.com',
        serviceType: 'myservice',
        serviceUri: 'http://myservice.com'
      }, done);
    });

    it('should accept a https uri for the serviceUri', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      p.register(plugin, {
        host: 'someservice.com',
        serviceType: 'myservice',
        serviceUri: 'https://myservice.com'
      }, done);
    });
  });

  describe('routes', function(){
    it('should register the discovery routes', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      p.register(plugin, {
        host: 'someservice.com',
        serviceType: 'myservice'
      }, function(err){
        routes.length.should.eql(4);
        routes[0].path.should.eql('/discovery/announce');
        routes[1].path.should.eql('/discovery/unannounce');
        routes[2].path.should.eql('/discovery/lease');
        routes[3].path.should.eql('/discovery/lastUpdate');
        done(err);
      });
    });
  });

  describe('init', function() {
    it('should exit on error when callback is not set', function(done) {
      var service = proxyquire("../lib/service.js", { 'ot-discovery': function DiscoveryClient() {
          return {
            connect: function(callback) {
              callback(new Error('test'));
            },
            onUpdate: function() { }
          };
        }
      });

      try {
        service.init({ log: function() {} }, { host: 'someservice.com' }, function () { });
      } catch(e) {
        done();
      }
    });

    it('should continue on error when onError callback is set', function(done) {
      var service = proxyquire("../lib/service.js", { 'ot-discovery': function DiscoveryClient() {
          return {
            connect: function(callback) {
              callback(new Error('test'));
            },
            onUpdate: function() { }
          };
        }
      });

      service.init(
          {
            log: function() {} },
          {
            host: 'someservice.com',
            onError: function(err) {
              done();
            }
          },
          function () { }
      );
    });
  });
});
