Parse.Cloud.define('getAllPatients', function(request, response) {
  var query = new Parse.Query('User'),
      admins = ["mar.ziolek@gmail.com", "jaroslaw.downar@vp.pl", "ziolkenzasd@interia.pl"];

  query.notContainedIn('email', admins);
  query.find({
    success: function(users) {
      response.success(users);
    }
  });
});