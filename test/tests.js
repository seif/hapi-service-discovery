describe('tests', function(){
  var should = require('should'),
      hoek = require('hoek'),
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
    expose: function(){},
    plugins: {
      'hapi-shutdown': {
        register: function(task){
          task.taskname.should.eql('discovery-unannounce');
          task.timeout.should.eql(30000);
          var t = task.task.should.be.an.Function;
        }
      }
    }
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

    it('should accept port number in host field', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      p.register(plugin, {
        host: 'someservice.com:8888',
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

  describe('graceful shutdown', function(){
    it('should add dependency on hapi-shutdown', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });
      var localPlugin = hoek.applyToDefaults({
        dependency: function(p, callback){
          p.should.eql('hapi-shutdown');
          done();
        }
      }, plugin);

      p.register(localPlugin, {
        host: 'someservice.com',
        serviceType: 'myservice',
        gracefulShutdown: true
      }, function(err){});
    });

    it('should add register the unannounce trigger with hapi-shutdown', function(done){
      var p = proxyquire("../index.js", { './lib/service': dummyService });

      var localPlugin = hoek.applyToDefaults({
        dependency: function(p, callback){
          p.should.eql('hapi-shutdown');
          callback(localPlugin, function(err){
            done(err);
          });
        }
      }, plugin);

      p.register(localPlugin, {
        host: 'someservice.com',
        serviceType: 'myservice',
        gracefulShutdown: true
      }, function(err){});
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
      var service = proxyquire("../lib/service.js",
      {
        'ot-discovery': function DiscoveryClient() {
          return {
            connect: function(callback) {
              callback(new Error('test'));
            },
            onUpdate: function() { }
          };
        }
      });

      service.init({ log: function() {} },
        {
          host: 'someservice.com',
          onError: function(err) {
            done();
          }
        },
        function () {}
      );
    });
  });

  describe('announce', function() {
    it('should announce with metadata when metadata is set', function(done) {
      var service = proxyquire("../lib/service.js",
      {
        'ot-discovery': function DiscoveryClient() {
          return {
            connect: function(callback) {
                callback();
            },
            onUpdate: function() { },
            announce: function(announcement) {
              announcement.metadata.test.should.eql(true);
              done();
            }
          };
        }
      });

      service.init({ log: function() {} },
        {
          host: 'someservice.com',
          metadata: { test: true }
        },
        function () { }
      );

      service.announce();
    });
  });
});
