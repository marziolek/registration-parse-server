// calendar

var _ = require('./underscore');

Parse.Cloud.define('getSchedule', function(request, response) {
  var query = new Parse.Query('day');

  query.ascending('number');
  query.find({
    success: function(results) {
      response.success(results);
    },
    error: function(error) {
      response.success(error);
    }
  });
});

Parse.Cloud.define('getMinMaxWorkHours', function(request, response) {
  var query = new Parse.Query('day');

  query.find({
    success: function(results) {
      var minMax = minMaxWorkHours(results);
      response.success(minMax);
    },
    error: function(error) {
      response.success(error);
    }
  });
});

Parse.Cloud.define('getDefaultWeeksAvailable', function(request, response) {
  var query = new Parse.Query('Settings');
  query.equalTo('name', 'weeksAvailable');

  query.first({
    success: function(results) {
      response.success(results);
    },
    error: function(error) {
      response.success(error);
    }
  });
});

Parse.Cloud.define('getDefaultVisitDuration', function(request, response) {
  var query = new Parse.Query('Settings');
  query.equalTo('name', 'visitDuration');

  query.first({
    success: function(results) {
      response.success(results);
    },
    error: function(error) {
      response.success(error);
    }
  });
});

// functions
var minMaxWorkHours = function(days) {
  var from = [], to = [], workHours = [], minFrom, maxTo;

  _.each(days, function(day) {
    if (day.attributes.workHours.from) {
      var number = day.attributes.workHours.from;
      number = number.replace(/:/g,'');
      from.push(parseInt(number));
    }
    if (day.attributes.workHours.to) {
      var number = day.attributes.workHours.to;
      number = number.replace(/:/g,'');
      to.push(parseInt(number));
    }
  });
  
  minFrom = Math.min.apply(null, from);
  minFrom = minFrom.toString();
  maxTo = Math.max.apply(null, to);
  maxTo = maxTo.toString();
  
  workHours = [makeHourString(minFrom), makeHourString(maxTo)];

  return workHours;
};

var makeHourString = function(hour) {
  var a = hour.slice(-6, -4), b = hour.slice(-4, -2), c = hour.slice(-2);
  
  return (a + ':' + b + ':' + c);
}