//Mailing notifications
var _ = require('./underscore'),
    nodemailer = require('nodemailer'),
    smtpConfig = {
      host: 'smtp.1and1.pl',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: 'rejestracja@ginekolog-boleslawiec.pl',
        pass: 'Jaroslaw16#ginekolog'
      }
    },
    // create reusable transporter object using the default SMTP transport
    transporter = nodemailer.createTransport(smtpConfig),
    emailSender = '"Rejestracja Ginekolog Jarosław Downar-Zapolski" <rejestracja@ginekolog-boleslawiec.pl>';

Parse.Cloud.define('sendEmail', function(request, response) {
  var email = request.params.mailData.email,
      subject = request.params.mailData.subject,
      body = request.params.mailData.body,
      // setup e-mail data with unicode symbols
      mailOptions = {
        from: emailSender, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        /* text: body, // plaintext body */
        html: body // html body
      };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    response.success(info);
  });
});

Parse.Cloud.define('verifyEmail', function(request, response) {
  var token = request.params.token,
      query = new Parse.Query('User');

  query.equalTo('emailVerifyToken', token);
  query.first({
    success: function(result) {
      result.set('emailVerified', true);
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
    },
    error: function(error) {
      response.success(error);
    }
  });
});
