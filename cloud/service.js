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
                newService.set('id', service.id);
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

              return newService.save({}, { useMasterKey: true });
            });
          }
        });

        return promise;
      };

  eachService().then( function(result) {
    response.success(true);
  }, function(result) {
    response.success(false);
  })
});

Parse.Cloud.define('removeService', function(request, response) {
  var query = new Parse.Query('Service');

  query.get(request.params.id).then( function(result) {
    return result.destroy({ useMasterKey: true });
  }).then( function(result) {
    response.success(result);
  }, function(error) {
    response.success(error);
  });
});

Parse.Cloud.define('addDayOff', function(request, response) {
  var Dayoff = Parse.Object.extend('Dayoff'),
      query = new Parse.Query(Parse.Object.extend('Dayoff')),
      dayoff = new Dayoff(),
      date = request.params.date,
      dateSave = new Date(date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear());

  query.equalTo('date', dateSave);
  query.first({
    success: function(result) {
      if (!result) {
        dayoff.save({
          date: dateSave
        }, { 
          useMasterKey: true,
          success: function(result) {
            response.success(result);
          }, 
          error: function(error) {
            response.success(error);
          }
        });
      } else {
        response.success({code: 123, message: 'To już jest dzień wolny'});
      }
    },
    error: function(error) {
      response.success(error);
    }
  });
});

Parse.Cloud.define('removeDayOff', function(request, response) {
  var Dayoff = Parse.Object.extend('Dayoff'),
      query = new Parse.Query(Parse.Object.extend('Dayoff')),
      date = request.params.date,
      dateToRemove = new Date(date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear());

  query.equalTo('date', dateToRemove);
  query.first({
    success: function(result) {
      result.destroy({ 
        success: function(result) {
          response.success(result);
        },
        error: function(error) {
          response.success(error);
        },
        useMasterKey: true
      })
    },
    error: function(error) {
      response.success(error);
    }
  });
});

Parse.Cloud.define('getAllDaysOff', function(request, response) {
  var Dayoff = Parse.Object.extend('Dayoff'),
      query = new Parse.Query(Dayoff),
      now = new Date();

  query.greaterThanOrEqualTo('date', new Date(now.getMonth() + 1 + '-' + now.getDate() + '-' + now.getFullYear()));
  query.find({
    success: function(result) {
      response.success(result);
    }, 
    error: function(error) {
      response.success(error);
    }
  });
});
