// day

// update all days workhours
Parse.Cloud.define('updateAllWH', function(request, response) {
  var query = new Parse.Query('day'),
      wh = request.params.wh;

  query.equalTo('number', wh.dow);
  query.find().then( function(result) {
    result[0].set('workHours', {"from": wh.start, "to": wh.end});
    result[0].set('isSet', wh.isSet);
    result[0].save({}, { useMasterKey: true }).then( function(savedResult) {
      response.success(savedResult);
    }, function(error) {
      response.success(error);
    })
  }, function(error) {
    response.success(error);
  })
});

var padTwoDigits = function(number) {
  return (number < 10 ? '0' : '') + number;
};


