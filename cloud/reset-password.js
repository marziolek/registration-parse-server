//reset password email
Parse.Cloud.define('resetPasswordEmail', function(request, response) {
  var query = new Parse.Query('User'),
      email = request.params.email;

  query.equalTo('email', email);
  query.first({
    success: function(result) {
      if (result.id) {
        var body = '<p>Kliknij w <a href="http://marcin-ziolek.usermd.net/rejestracja/reset-hasla?token=' + result.get('emailVerifyToken') +'">ten link</a>, aby zresetować swoje hasło.</p><p>Jeśli link nie działa, skopiuj do przeglądarki poniższy adres:</p><p>http://marcin-ziolek.usermd.net/rejestracja/reset-hasla?token=' + result.get('emailVerifyToken') +'</p>';
        Parse.Cloud.run('sendEmail', {
          mailData: {
            email: email, 
            subject: 'Link do zmiany straconego hasła - rejestracja', 
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

//reset password
Parse.Cloud.define('resetPassword', function(request, response) {
  var query = new Parse.Query('User'),
      token = request.params.token,
      newPassword = request.params.newPassword,
      newPasswordConfirmation = request.params.newPasswordConfirmation;
  
  if (newPassword == newPasswordConfirmation) {
    query.equalTo('emailVerifyToken', token);
    query.find({
      success: function(result) {
        if (result) {
          result = result[0];
          result.set('password', newPassword);
          result.set('emailVerifyToken', Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2));
          result.save(null, {
            success: function(result) {
              if (result.id) {
                response.success(true);
              } else {
                response.success(false);
              }
            },
            error: function(error) {
              response.success(error);
            },
            useMasterKey: true
          });
        } else {
          response.success('Zły token. Zresetuj hasło jeszcze raz.');
        }
      },
      error: function(error) {
        response.success('Zły token. Zresetuj hasło jeszcze raz.');
      }
    })
  }
});
