var btn = document.getElementById('resetPassword'),
    form = document.getElementById('resetPasswordForm');

btn.addEventListener('click', function() {
  var newPassword = document.getElementById('newPassword'),
      newPasswordConfirmation = document.getElementById('newPasswordConfirmation');

  Parse.Cloud.run('resetPassword', {
    token: token, 
    newPassword: newPassword.value, 
    newPasswordConfirmation: newPasswordConfirmation.value
  }).then( function(result) {
    console.log(result + ' result');
    if (result == true) {
      msg.innerHTML = 'Twoje hasło zostało zmienione.';
      login.classList.add('show');
      form.remove();
    } else if (result == 'Zły token. Zresetuj hasło jeszcze raz.') {
      form.remove();
      msg.innerHTML = 'Zły token. Zresetuj hasło jeszcze raz.'
    } else if (result == 'Coś poszło nie tak. Spróbuj jeszcze raz.') {
      form.remove();
      msg.innerHTML = 'Coś poszło nie tak. Odśwież tę stronę.'
    } else {
      form.remove();
      msg.innerHTML = 'Coś poszło nie tak. Odśwież tę stronę.'
    }
  })
}, false);