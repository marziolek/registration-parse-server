var _ = require('./underscore');
 
Parse.Cloud.define('getSpots', function(request, response) {
    var allSpots = [];
     
    if (Parse.Cloud.run('isAdmin')) {
        var spots = new Parse.Query('Spot');
        spots.find({
            success: function(results) {
                _.each(results, function(result) {
                    allSpots.push(result);
                });
                response.success(allSpots);
            }
        });
    } else {
        response.success('Sorry, yoo are not allowed here!');
    };
});
 
Parse.Cloud.define('createSpot', function(request, response) {
    var spotName = request.params.spotname;
 
    var spot = Parse.Object.extend('Spot');
    var newSpot = new spot();
 
    newSpot.set('spotname', spotName);
    newSpot.set('f_emergency', request.params.emergency);
    newSpot.set('f_outside', request.params.outside);
    newSpot.set('f_removed', false);
 
    var checkSpots = new Parse.Query('Spot');
    checkSpots.equalTo('spotname', spotName);
 
    checkSpots.first({
        success: function(result) {
            if (!result) {
                newSpot.save(null, {
                    success: function(newSpot) {
                        response.success(newSpot);
                    },
                    error: function(newSpot, error) {
                        response.success(error);
                    }
                });
            } else {
                response.success(false);  
            };
        },
        error: function (error) {
            newSpot.save(null, {
                success: function(newSpot) {
                    response.success(newSpot);
                },
                error: function(newSpot, error) {
                    response.success(error);
                }
            });
        }
    });
});
 
Parse.Cloud.define('removeSpot', function(request, response) {
    var spotId = request.params.spotId;
    var spots = new Parse.Query('Spot');
    spots.equalTo('objectId', spotId);
 
    spots.first({
        success: function(object) {
            if (object) {
                object.set('f_removed', true);
                object.save(null, {
                    success: function() {
                        response.success(true);   
                    }
                });
            } else {
                response.success(false);
            };
        },
        error: function(error) {
            response.success(error);
        }
    });
});
 
Parse.Cloud.define('updateSpot', function(request, response) {
    var spotId = request.params.spotId;
    var spots = new Parse.Query('Spot');
    spots.equalTo('objectId', spotId);
 
    spots.first({
        success: function(object) {
            if (object) {
                object.set('spotname', request.params.spotname);
                object.set('f_emergency', request.params.emergency);
                object.set('f_outside', request.params.outside);
                object.save(null, {
                    success: function(updatedObject) {
                        response.success(updatedObject);
                    }
                });
            } else {
                response.success(false);
            };
        },
        error: function(error) {
            response.success(error);
        }
    });
});