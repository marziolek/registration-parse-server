Parse.Cloud.define('updateProfile', function(request, response) {
  var userId = request.params.userId,
      phone = request.params.profileData.phone,
      textMessages = request.params.profileData.textMessages,
      query = new Parse.Query('User');

  if (phone) {
    if (!phone.toString().match(/^\d{9,9}$/)) {
      response.success({error: 'Niepoprawny numer telefonu'});
    }
  }

  query.get(userId, {
    success: function(result) {
      result.set('phone', phone);
      result.set('textMessages', textMessages);
      result.save(null, {
        success: function(user) {
          response.success(user);
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
