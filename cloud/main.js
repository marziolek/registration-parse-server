var _ = require('./underscore');

require('./crud.js');
require('./email.js');
require('./calendar.js');
require('./service.js');
require('./day.js');
require('./visit.js');

//email validation
/*Parse.Cloud.beforeSave("_User", function(request, response) {

});*/

//user role settings
Parse.Cloud.afterSave(Parse.User, function(request) {
  Parse.Cloud.useMasterKey();  
  
  var admins = ["mar.ziolek@gmail.com", "jaroslaw.downar@vp.pl"],
      userEmail = request.user.attributes.username;

  if (admins.indexOf(userEmail) < 0) {
    var query = new Parse.Query(Parse.Role);
    query.equalTo("name", "User");
    query.first ( {
      success: function(object) {
        object.relation("users").add(request.user);
        object.save();
      },
      error: function(error) {
        throw "Got an error " + error.code + " : " + error.message;
      }
    });
  } else {
    var queryAdmin = new Parse.Query(Parse.Role);
    queryAdmin.equalTo("name", "Administrator");
    queryAdmin.first ( {
      success: function(object) {
        object.relation("users").add(request.user);
        object.save();
      },
      error: function(error) {
        throw "Got an error " + error.code + " : " + error.message;
      }
    });
  }
});

//check if user is admin
Parse.Cloud.define('isAdmin', function(request, response) {
  var query = (new Parse.Query(Parse.Role));
  query.equalTo("name", "Administrator");
  query.equalTo("users", Parse.User.current());
  query.first().then(function(adminRole) {
    response.success(adminRole ? true : false);
  });
});

//check if user has validated email
Parse.Cloud.define('isVerified', function(request, response) {
  var query = new Parse.Query("User");
  query.equalTo('email', request.params.email);
  query.find({
    success: function(result) {
      if (result[0].attributes.emailVerified){
        response.success(result[0].attributes.emailVerified);
      } else {
        response.success("User is not verified");
      }
    },
    error: function(error) {
      response.error(error);
    }
  });
});

//check if user wants text messages
Parse.Cloud.define('isTextMessages', function(request, response) {
  var query = new Parse.Query("User");
  query.equalTo('email', request.params.email);
  query.find({
    success: function(result) {
      response.success(result);
    },
    error: function(error) {
      response.error(error);
    }
  });
});

//resend confirmation email
Parse.Cloud.define('resendVerificationEmail', function(request, response) {
  Parse.Cloud.useMasterKey(); 

  var query = new Parse.Query('User');

  query.equalTo('username', request.params.username);
  query.first({
    success: function(result) {
      var myEmail = result.getEmail();
      //fake mail is needed 
      var fakeMail = 'resendVerificationEmail@infusion.com';
      result.set('email', fakeMail);
      result.save(null, {
        success: function(result) {
          result.set('email', myEmail);
          result.save();
          response.success(true);
        },
        error: function(error) {

        }
      });
    }
  })
});