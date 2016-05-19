// visit

var _ = require('./underscore');
var moment = require('./moment');

Parse.Cloud.define('bookVisit', function(request, response) {
  var date = request.params.date,
      user = request.params.user,
      userOneTime = request.params.userOneTime,
      service = request.params.service,
      additionalInformation = request.params.additionalInformation,
      reservation = Parse.Object.extend('Reservation'),
      newReservation = new reservation(),
      Reservations = new Parse.Query('Reservation');

  newReservation.set('date', date);
  if (user) {
    newReservation.set('user', { __type: 'Pointer', className: '_User', objectId: user });
  };  
  if (service) {
    newReservation.set('service', { __type: 'Pointer', className: 'Service', objectId: service });
  };
  newReservation.set('userOneTime', userOneTime);
  newReservation.set('additionalInformation', additionalInformation);
  newReservation.set('isCanceled', false);

  Reservations.equalTo('date', date);

  Reservations.first({
    success: function(result) {
      if (!result || result.attributes.isCanceled) {
        newReservation.save(null, {
          success: function(result) {
            response.success(result);
          },
          error: function(result, error) {
            response.success(error);
          }
        });
      } else {
        response.success(false); // already taken
      };
    },
    error: function (error) {
      newReservation.save(null, {
        success: function(result) {
          response.success(result);
        },
        error: function(result, error) {
          response.success(error);
        }
      });
    }
  });
});

Parse.Cloud.define('getAllVisits', function(request, response) {
  var allVisits = [],
      from = request.params.from;

  if (Parse.Cloud.run('isAdmin')) {
    var firstVisitEver = new Parse.Query('Reservation'),
        visits = new Parse.Query('Reservation');

    visits.greaterThanOrEqualTo('date', from);
    visits.ascending('date');
    visits.find({
      success: function(results) {
        _.each(results, function(result) {
          allVisits.push(result);
        });

        firstVisitEver.ascending('date');
        firstVisitEver.first({
          success: function(result) {
            if (formatDate(result.attributes.date) < formatDate(from)) {
              response.success([allVisits, true]);
            } else {
              response.success([allVisits, false]);
            }
          }
        })
      },
      error: function(result) {
        response.success(result);
      }
    });
  } else {
    response.success('Sorry, yoo are not allowed here!');
  };
});

Parse.Cloud.define('getAllBooked', function(request, response) {
  var allBookedVisits = [],
      from = request.params.from,
      visits = new Parse.Query('Reservation');

  visits.equalTo('isCanceled', false);
  visits.greaterThanOrEqualTo('date', from);
  visits.ascending('date');
  visits.find({
    success: function(results) {
      _.each(results, function(result) {
        allBookedVisits.push({
          start: result.attributes.date,
          end: result.attributes.date,
          className: 'taken',
        });
      });

      response.success(allBookedVisits);
    },
    error: function(result) {
      response.success(result);
    }
  });
});

Parse.Cloud.define('cancelVisit', function(request, response) {
  var id = request.params.id,
      visits = new Parse.Query('Reservation');

  visits.get(id, {
    success: function(result) {
      result.set('isCanceled', true);
      result.save().then( function(result) {
        response.success(result);
      });
    },
    error: function(result) {
      response.success(result);
    }
  })
});

Parse.Cloud.define('enableVisit', function(request, response) {
  var id = request.params.id,
      visits = new Parse.Query('Reservation');

  visits.get(id, {
    success: function(result) {
      result.set('isCanceled', false);
      result.save().then( function(result) {
        response.success(result);
      });
    },
    error: function(result) {
      response.success(result);
    }
  })
});

var formatDate = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
};
