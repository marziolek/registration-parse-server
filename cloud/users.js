Parse.Cloud.define('getAllPatients', function(request, response) {
  var query = new Parse.Query('User'),
      admins = ['mar.ziolek@gmail.com', 'jaroslaw.downar@vp.pl'];

  query.notContainedIn('email', admins);
  query.find({
    success: function(result) {
      response.success(result);
    },
    error: function(error) {
      response.success(error);
    }
  });
});