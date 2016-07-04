var _ = require('./underscore');

Parse.Cloud.define('JOBnotifyUpcomingVisit', function(request, response) {
  var now = new Date();

  /* query for all visits */
  var userToNotify = [],
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      visits = new Parse.Query('Reservation'),
      period = request.params.period,
      to = '';

  if (period === 'days') {
    to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3) // add 3 days
    visits.equalTo('notified', 0);
  } else if (period === 'hours') {
    to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 3, now.getMinutes()) // 3 hours
    visits.equalTo('notified', 1);
  } else {
    to = now; 
  };

  visits.equalTo('isCanceled', false);
  visits.greaterThanOrEqualTo('date', from);
  visits.lessThanOrEqualTo('date', to);
  visits.ascending('date');
  visits.include('User');
  visits.find({
    success: function(results) {
      _.each(results, function(result) {
        if (result.attributes.userOneTime) {
          var email = result.attributes.userOneTime.email,
              phone = result.attributes.userOneTime.phone,
              date = result.attributes.date,
              emailSubject = 'Niedługo termin twojej wizyty',
              emailBody = '<p>Twoja umówiona wizyta niedługo się odbędzie.</p><p>Data wizyty: <strong>' + padTwoDigits(date.getDate()) + '-' + padTwoDigits(date.getMonth() + 1) + '-' + date.getFullYear() + '</strong>, godz. <strong>' + padTwoDigits(date.getHours()) + ':' + padTwoDigits(date.getMinutes()) +'</strong></p>' + '<br><p>__________</p><p>Specjalistyczna Praktyka Lekarska, Jarosław Downar-Zapolski</p><p>Bolesławiec, ul. Zgorzelecka 12, III piętro</p>';

          if (email) {
            Parse.Cloud.run('sendEmail', {
              mailData: {
                email: email, 
                subject: emailSubject,
                body: emailBody
              }
            }).then( function(emailSent) {
              var notifiedCount = result.attributes.notified;
              if (phone) {
                Parse.Cloud.run('sendSMS', {data: {
                  to: phone, 
                  msg: 'Przypomnienie o Twojej wizycie dnia '+ padTwoDigits(date.getDate()) + '-' + padTwoDigits(date.getMonth() + 1) + ' o godz. '+ padTwoDigits(date.getHours()) + ':' + padTwoDigits(date.getMinutes()) +'. Aby odwolac wizyte wejdz na strone http://idz.do/AtPyLg Jaroslaw Downar-Zapolski'
                }});
                result.set('notified', ++notifiedCount);
                result.save(null, { 
                  success: function(res) {
                    response.success(res);
                  },
                  error: function(err) {
                    response.success(err);
                  },
                  useMasterKey: true 
                });
                return;
              } else {
                result.set('notified', ++notifiedCount);
                result.save(null, { 
                  success: function(res) {
                    response.success(res);
                  },
                  error: function(err) {
                    response.success(err);
                  },
                  useMasterKey: true 
                });
                return;
              }
            });
          }
        } else {
          var user = result.get('user');

          user.fetch({
            success: function(user) {
              var email = user.get('email'),
                  phone = user.get('phone'),
                  date = result.attributes.date,
                  emailSubject = 'Niedługo termin twojej wizyty',
                  emailBody = '<p>Twoja umówiona wizyta niedługo się odbędzie.</p><p>Data wizyty: <strong>' + padTwoDigits(date.getDate()) + '-' + padTwoDigits(date.getMonth() + 1) + '-' + date.getFullYear() + '</strong>, o godzinie <strong>' + padTwoDigits(date.getHours()) + ':' + padTwoDigits(date.getMinutes()) +'</strong></p>' + '<br><p>Jeśli chcesz anulować wizytę, zaloguj się do <a href="http://rejestracja.ginekolog-boleslawiec.pl/#/profile/visits">Panelu pacjentki</a></p>' + '<br><p>__________</p><p>Specjalistyczna Praktyka Lekarska, Jarosław Downar-Zapolski</p><p>Bolesławiec, ul. Zgorzelecka 12, III piętro</p>';

              if (email) {
                Parse.Cloud.run('sendEmail', {
                  mailData: {
                    email: email, 
                    subject: emailSubject,
                    body: emailBody
                  }
                }).then( function(emailSent) {
                  var notifiedCount = result.attributes.notified;
                  if (phone) {                    
                    Parse.Cloud.run('sendSMS', {data: {
                      to: phone, 
                      msg: 'Przypomnienie o Twojej wizycie dnia '+ padTwoDigits(date.getDate()) + '-' + padTwoDigits(date.getMonth() + 1) + ' o godz. '+ padTwoDigits(date.getHours()) + ':' + padTwoDigits(date.getMinutes()) +'. Aby odwolac wizyte zaloguj sie na http://idz.do/AtPyLg Jaroslaw Downar-Zapolski'
                    }});
                    result.set('notified', ++notifiedCount);
                    result.save(null, { 
                      success: function(res) {
                        response.success(res);
                      },
                      error: function(err) {
                        response.success(err);
                      },
                      useMasterKey: true 
                    });
                    return;
                  } else {
                    result.set('notified', ++notifiedCount);
                    result.save(null, { 
                      success: function(res) {
                        response.success(res);
                      },
                      error: function(err) {
                        response.success(err);
                      },
                      useMasterKey: true 
                    });
                    return;
                  }
                });
              }
            }
          });
        };
      });
    },
    error: function(result) {
      response.success(result);
    }
  });
});

var padTwoDigits = function(number) {
  return (number < 10 ? '0' : '') + number;
};

var CronJob = require('cron').CronJob,
    jobDays = new CronJob(
      '00 00 10 * * 0-6', 
      function() {
        Parse.Cloud.run('JOBnotifyUpcomingVisit', {period: 'days'}).then( function(result) { return });
      }, 
      null,
      false, 
      'Europe/Warsaw'
    ),
    jobHours = new CronJob(
      '0 */15 * * * *', 
      function() {
        Parse.Cloud.run('JOBnotifyUpcomingVisit', {period: 'hours'}).then( function(result) { return });
      }, 
      null,
      false, 
      'Europe/Warsaw'
    );

jobDays.start();
jobHours.start();
