var SMSAPI = require('smsapi'),
    smsapi = new SMSAPI({
      oauth: {
        accessToken: 'f9SrRD0gOCZVJKV0oWp6ORaMev7jGqHGD1VmH5XL'
      }
    });

function sendSMS(data) {
  var from = data.from, // name to display
      to = data.to, // phone number
      msg = data.msg;

  return smsapi.message
    .sms()
    .from(from)
    .to(to)
    .message(msg)
    .execute(); // return Promise
};

Parse.Cloud.define('sendSMS', function(request, response) {
  var SMSdata = { 
    from: 'Ginekolog', 
    to: request.params.data.to, 
    msg: request.params.data.msg
  };

  sendSMS(SMSdata).then( function(success) {
    response.success(success);
  }).catch( function(error) {
    response.success(error);
  })
});
