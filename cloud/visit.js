// visit

var _ = require('./underscore');
var moment = require('./moment');

Parse.Cloud.define('bookVisit', function(request, response) {
  var date = request.params.data.date,
      user = request.params.data.user,
      userOneTime = request.params.data.userOneTime,
      service = request.params.data.service,
      additionalInformation = request.params.data.additionalInformation,
      reservation = Parse.Object.extend('Reservation'),
      newReservation = new reservation(),
      Reservations = new Parse.Query('Reservation'),
      emailEmail = request.params.email.email,
      emailSubject = request.params.email.subject,
      emailBody = request.params.email.body;

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
            if (result.id) {

              Parse.Cloud.run('sendEmail', {
                mailData: {
                  email: emailEmail, 
                  subject: emailSubject,
                  body: emailBody
                }
              })
            };
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
    visits.include('User');
    visits.find({
      success: function(results) {
        if (results.length > 0) {
          _.each(results, function(result) {
            var user = result.get('user');

            if (!user) {
              var obj = {
                user: result.userOneTime,
                date: result.attributes.date,
                isCanceled: result.attributes.isCanceled,
                additionalInformation: result.attributes.additionalInformation,
                userOneTime: result.attributes.userOneTime,
                id: result.id
              };

              allVisits.push(obj);

              if (results.length == results.indexOf(result) + 1) {
                response.success([allVisits, true]);
              }
            } else {
              user.fetch({
                success: function(user) {
                  var obj = {
                    user: user,
                    date: result.attributes.date,
                    isCanceled: result.attributes.isCanceled,
                    additionalInformation: result.attributes.additionalInformation,
                    userOneTime: result.attributes.userOneTime,
                    id: result.id
                  };

                  allVisits.push(obj);
                  if (results.length == results.indexOf(result) + 1) {
                    firstVisitEver.ascending('date');
                    firstVisitEver.first({
                      success: function(result) {
                        if (formatDate(result.attributes.date) < formatDate(from)) {
                          response.success([allVisits, true]);
                        } else {
                          response.success([allVisits, false]);
                        }
                      },
                      error: function(result) {
                        response.success(result);
                      }
                    });              
                  }
                },
                error: function(error) {
                  response.success(error);
                }
              });
            }
          });
        } else {
          response.success([null, false]);
        }
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
      result.get('date');
      visits.notEqualTo('objectId', id);
      visits.equalTo('date', result.get('date'));
      visits.equalTo('isCanceled', false);
      visits.find({
        success: function(resultOthers) {
          if (resultOthers.length > 0) {
            response.success('Termin jest już zajęty');
          } else {
            result.set('isCanceled', false);
            result.save().then( function(result) {
              response.success(result);
            });
          }
        }
      });
    },
    error: function(result) {
      response.success(result);
    }
  })
});

Parse.Cloud.define('getMyVisits', function(request, response) {
  var allVisits = [],
      from = request.params.from,
      firstVisitEver = new Parse.Query('Reservation'),
      visits = new Parse.Query('Reservation'),
      User = Parse.Object.extend('User'),
      userPointer = new User({id: request.user.id}); // User pointer

  if (from) {
    visits.greaterThanOrEqualTo('date', from);
  };

  visits.ascending('date');
  visits.equalTo('user', userPointer);
  visits.find({
    success: function(results) {
      if (results.length > 0) {
        _.each(results, function(result) {
          var obj = {
            date: result.attributes.date,
            isCanceled: result.attributes.isCanceled,
            additionalInformation: result.attributes.additionalInformation,
            id: result.id
          };

          allVisits.push(obj);
          if (results.length == results.indexOf(result) + 1) {
            firstVisitEver.ascending('date');
            firstVisitEver.first({
              success: function(result) {
                if (formatDate(result.attributes.date) < formatDate(from)) {
                  response.success([allVisits, true]);
                } else {
                  response.success([allVisits, false]);
                }
              },
              error: function(result) {
                response.success(result);
              }
            });              
          }
        });
      } else {
        response.success([null, false]);
      }
    },
    error: function(result) {
      response.success(result);
    }
  });
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

var formatDate = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
};
