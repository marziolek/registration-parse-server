var _ = require('./underscore');

require('./crud.js');
require('./sms.js');
require('./email.js');
require('./calendar.js');
require('./service.js');
require('./day.js');
require('./visit.js');
require('./reset-password.js');
require('./users.js');
require('./jobs.js');

Parse.Cloud.define('newAccount', function(request, response) {
  var form = request.params.form,
      user = new Parse.User(),
      token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2),
      query = new Parse.Query('User');

  query.equalTo('email', form.email);
  query.first({
    success: function(result) {
      if (!result) {
        user.set('email', form.email);
        user.set('username', form.email);
        user.set('firstName', form.name);
        user.set('lastName', form.lastname);
        user.set('password', form.password);
        user.set('phone', form.phone);
        user.set('textMessages', form.textMessages);
        user.set('emailVerified', false);
        user.set('emailVerifyToken', token);

        user.signUp(null, {
          success: function(user) {
            var body = '<p>Dziękujemy za stworzenie konta!</p><p>Kliknij w <a href="http://marcin-ziolek.usermd.net/rejestracja/potwierdzenie-email?token=' + token +'">ten link</a>, aby potwierdzić swój adres email.</p><p>Jeśli link nie działa, skopiuj do przeglądarki poniższy adres:</p><p>http://marcin-ziolek.usermd.net/rejestracja/potwierdzenie-email?token=' + token +'</p>';
            Parse.Cloud.run('sendEmail', {
              mailData: {
                email: form.email, 
                subject: 'Weryfikacja email - rejestracja', 
                body: body
              }
            });

            response.success(user);
          },
          error: function(error) {
            response.success(error);
          },
          useMasterKey: true
        });
      } else {
        response.success(false);
      }
    }
  });
});

//user role settings
Parse.Cloud.afterSave(Parse.User, function(request) {
  //Parse.Cloud.useMasterKey();  

  var admins = ["mar.ziolek@gmail.com", "jaroslaw.downar@vp.pl", "ziolkenzasd@interia.pl"],
      userEmail = request.user.attributes.username,
      userObj = request.user.attributes;

  if (admins.indexOf(userEmail) < 0) {
    var query = new Parse.Query("_Role");
    query.equalTo("name", "User");
    query.first ( {
      success: function(object) {
        //object.relation("users").add(request.user);
        object.getUsers().add(request.user);
        object.save({}, { useMasterKey: true });

        // send verification email
        Parse.Cloud.run('sendMail', {mailData: {email: userEmail, title: 'Potwierdź swój email', body: userObj}}, {
          success: function(result) {
            console.log(result)
          }
        });
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
        object.save(null, { useMasterKey: true });
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
  query.equalTo("users", request.user);
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
        response.success({verified: result[0].attributes.emailVerified, msg: ''});
      } else {
        response.success({verified: result[0].attributes.emailVerified, msg: 'Sprawdź swoją pocztę i potwierdź adres email.'});
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
  var query = new Parse.Query('User'),
      email = request.params.email.email;

  query.equalTo('email', email);
  query.first({
    success: function(result) {
      if (result.id) {
        var body = '<p>Dziękujemy za stworzenie konta!</p><p>Kliknij w <a href="http://marcin-ziolek.usermd.net/rejestracja/potwierdzenie-email?token=' + result.get('emailVerifyToken') +'">ten link</a>, aby potwierdzić swój adres email.</p><p>Jeśli link nie działa, skopiuj do przeglądarki poniższy adres:</p><p>http://marcin-ziolek.usermd.net/rejestracja/potwierdzenie-email?token=' + result.get('emailVerifyToken') +'</p>';
        Parse.Cloud.run('sendEmail', {
          mailData: {
            email: email, 
            subject: 'Weryfikacja email - rejestracja', 
            body: body
          }
        }).then(function(result) {
          response.success(result);
        });
      }
    },
    error: function(error) {
      response.success('Użytkownik z tym emailem nie istnieje.');
    }
  })
});
