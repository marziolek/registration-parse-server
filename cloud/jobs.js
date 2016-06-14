var _ = require('./underscore');

Parse.Cloud.define('JOBnotifyUpcomingVisit', function(request, response) {
  var now = new Date();

  /* query for all visits */
  var userToNotify = [],
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3), // add 3 days
      visits = new Parse.Query('Reservation');

  visits.equalTo('isCanceled', false);
  visits.notEqualTo('notified', true);
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
              emailBody = '<p>Twoja umówiona wizyta niedługo się odbędzie.</p><p>Data wizyty: <strong>' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + '</strong>, godz. <strong>' + date.getHours() + ':' + date.getMinutes() +'</strong></p>' + '<br><p>__________</p><p>Specjalistyczna Praktyka Lekarska, Jarosław Downar-Zapolski</p><p>Bolesławiec, ul. Zgorzelecka 12, III piętro</p>';

          Parse.Cloud.run('sendEmail', {
            mailData: {
              email: email, 
              subject: emailSubject,
              body: emailBody
            }
          }).then( function(emailSent) {
            result.set('notified', true);
            result.save({},{ useMasterKey: true });
            return;
          });
        } else {
          var user = result.get('user');

          user.fetch({
            success: function(user) {
              var email = user.get('email'),
                  phone = user.get('phone'),
                  date = result.attributes.date,
                  emailSubject = 'Niedługo termin twojej wizyty',
                  emailBody = '<p>Twoja umówiona wizyta niedługo się odbędzie.</p><p>Data wizyty: <strong>' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + '</strong>, o godzinie <strong>' + date.getHours() + ':' + date.getMinutes() +'</strong></p>' + '<br><p>Jeśli chcesz anulować wizytę, zaloguj się do <a href="http://rejestracja.ginekolog-boleslawiec.pl/#/profile/visits">Panelu pacjentki</a></p>' + '<br><p>__________</p><p>Specjalistyczna Praktyka Lekarska, Jarosław Downar-Zapolski</p><p>Bolesławiec, ul. Zgorzelecka 12, III piętro</p>';

              Parse.Cloud.run('sendEmail', {
                mailData: {
                  email: email, 
                  subject: emailSubject,
                  body: emailBody
                }
              }).then( function(emailSent) {
                result.set('notified', true);
                result.save({},{ useMasterKey: true });
                return;
              });
            }
          });
        };
      });

      response.success(results);
    },
    error: function(result) {
      response.success(result);
    }
  });
});

var CronJob = require('cron').CronJob,
    job = new CronJob(
      '00 00 12 * * 0-6', 
      function() {
        Parse.Cloud.run('JOBnotifyUpcomingVisit').then( function(result) { return });
      }, 
      function () {},
      false, 
      'Europe/Warsaw'
    );

job.start();
