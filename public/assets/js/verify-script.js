Parse.Cloud.run('verifyEmail', {token: token}).then( function(result) {
  if (result) {
    msg.innerHTML = 'Twój mail został potwierdzony.';
    login.classList.add('show');
  } else {
    msg.innerHTML = 'Coś poszło nie tak. Odśwież tę stronę.'
  }
});