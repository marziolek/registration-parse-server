//Mailing notifications
var _ = require('./underscore');
 
//var Mandrill = require('mandrill');
//Mandrill.initialize('jocT9rEAZDBLO7GKHgLU5A'); 
 
Parse.Cloud.define('mailAllUsers', function(request, response) {
    var allUsers = new Parse.Query(Parse.User);
 
    allUsers.each(function(user, status) {
        Mandrill.sendTemplate({
            template_name: 'parkspot-draw-reminder',
            template_content: [{
                name: 'username',
                content: user.firstName
            }],
            message: {
                text: "Hello!",
                subject: "Parkspoty reminder",
                from_email: "parkspoty@infusion.com",
                from_name: "Parkspoty",
                to: [{
                    email: user.email
                }]
            },
            async: true
        },{
            success: function(httpResponse) {
                console.log(httpResponse);
                response.success("Emails sent to all users!");
            },
            error: function(httpResponse) {
                console.error(httpResponse);
                response.error(httpResponse);
            }
        });
    });
});
 
Parse.Cloud.define('sendNotificationFreeSpot', function(request, response) {
    var freeSpotNumber = request.params.spotNumber;
    var date = request.params.date;
 
    var usersForFreeSpot = new Parse.Query(Parse.User);
    usersForFreeSpot.equalTo('f_alertFreeSpot', true);
 
    usersForFreeSpot.find({
        success: function(users) {
            _.each(users, function(user) {
                Mandrill.sendTemplate({
                    template_name: 'parkspot-free-spot',
                    template_content: [{
                        name: 'username',
                        content: user.attributes.firstName
                    },{
                        name: 'date',
                        content: date
                    },{
                        name: 'spotNumber',
                        content: freeSpotNumber
                    }],
                    message: {
                        text: "Hello!",
                        subject: "Parkspoty - free spot",
                        from_email: "parkspoty@infusion.com",
                        from_name: "Parkspoty",
                        to: [{
                            email: user.attributes.email
                        }]
                    },
                    async: true
                },{
                    success: function(httpResponse) {
                        response.success(true);
                    },
                    error: function(httpResponse) {
                        response.error(httpResponse);
                    }
                });
            });
        },
        error: function(error) {
            response.success(error);   
        }
    });
});
 
Parse.Cloud.define('sendNotification', function(request, response) {
    var args = request.params.args;
 
    var email;
    var customMessage = '';
    var subject = '';
 
    var email = args.email;
    if (args.message) {
        customMessage = args.message;
    };
    if (args.subject) {
        subject = args.subject;   
    };
 
    var user = new Parse.Query(Parse.User);
    user.equalTo('email', email);
 
    user.first({
        success: function(userToMail) {
            Mandrill.sendTemplate({
                template_name: 'parkspot-notification',
                template_content: [{
                    name: 'username',
                    content: userToMail.attributes.firstName
                },{
                    name: 'message',
                    content: customMessage
                },{
                    name: 'subject',
                    content: subject
                }],
                message: {
                    text: "Hello!",
                    subject: subject,
                    from_email: "parkspoty@infusion.com",
                    from_name: "Parkspoty",
                    to: [{
                        email: email
                    }]
                },
                async: true
            },{
                success: function(httpResponse) {
                    response.success(true);
                },
                error: function(httpResponse) {
                    response.error(httpResponse);
                }
            });
        },
        error: function(error) {
            response.success(error);   
        }
    });
});
 