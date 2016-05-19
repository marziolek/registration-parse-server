// service

var _ = require('./underscore');

Parse.Cloud.define('getAllServices', function(request, response) {
  var query = new Parse.Query('Service');

  query.ascending('order');
  query.find({
    success: function(results) {
      var allServices = [];
      _.each(results, function(result) {
        allServices.push({
          id: result.id,
          name: result.attributes.name,
          priceFrom: result.attributes.priceFrom,
          priceTo: result.attributes.priceTo,
          order:  result.attributes.order,
          isActive:  result.attributes.isActive
        })
      });

      response.success(allServices);
    },
    error: function(error) {
      response.success(error);
    }
  });
});

Parse.Cloud.define('updateServices', function(request, response) {
  var query = new Parse.Query('Service'),
      eachService = function() {
        var promise = Parse.Promise.as();

        _.each(request.params.services, function(service) {
          var Service = Parse.Object.extend('Service'),
              newService = new Service();

          if (service.name) {
            promise = promise.then(function() {
              if (service.id) {
                newService.set('objectId', service.id);
                newService.set('name', service.name);
                newService.set('priceFrom', service.priceFrom);
                newService.set('priceTo', service.priceTo);
                newService.set('order', service.order);
                newService.set('isActive', service.isActive);
              } else {
                newService.set('name', service.name);
                newService.set('priceFrom', service.priceFrom);
                newService.set('priceTo', service.priceTo);
                newService.set('order', service.order);
                newService.set('isActive', service.isActive);
              }

              return newService.save()
            })
          }
        });

        return promise;
      };

  eachService().then( function() {
    response.success(true)
  }, function() {
    response.success(false)
  })
});

Parse.Cloud.define('removeService', function(request, response) {
  var query = new Parse.Query('Service');
  
  query.get(request.params.id).then( function(result) {
    return result.destroy();
  }).then( function(result) {
    response.success(result);
  }, function(error) {
    response.success(error);
  });
});
