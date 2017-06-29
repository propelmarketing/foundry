(function () {
  'use strict';

  const progress = $('#password-strength');
  progress.progress({
    value: 0
  });
  const form = $('#password-reset-form');
  form.submit(processForm);
  $('#new-password').keyup(passwordStrengthCalculator);

  function processForm(e) {
    e.preventDefault();

    const password = $('#new-password').val();
    const confirmation = $('#confirm-password').val();
    const email = $('#email').val();
    const errorMsg = $('#error-message');

    const passwordMsg = checkIfValidPassword(password);
    const confirmMsg = checkIfPasswordsMatch(password, confirmation);

    $('#new-password-error').html(passwordMsg).toggle(!!passwordMsg);
    $('#confirm-password-error').html(confirmMsg).toggle(!!confirmMsg);
    errorMsg.hide();

    if (!passwordMsg && !confirmMsg) {
      form.addClass('loading');
      Promise.race([
        fetch('/auth/password-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            NewPassword: password,
            ConfirmPassword: confirmation,
            email
          })
        }),
        new Promise(function (_, reject) {
          setTimeout(function () {
            reject(new Error('Timed Out!'));
          }, 5000);
        })
      ]).then(function (resp) {
        if (resp.redirected) {
          window.location.href = resp.url;
          return resp;
        }
        return resp.json();
      }).then(function (resp) {
        if (resp.status >= 200 && resp.status < 300) {
          return resp;
        }
        const error = new Error(resp.message);
        throw error;
      }).catch(function (err) {
        return errorMsg.html(err.message).show();
      }).then(function () {
        form.removeClass('loading');
      });
    }
  }

  function checkIfValidPassword(password) {
    if (!validator.isLength(password, { min: 8, max: undefined })) {
      return 'Password must be at least 8 characters long.';
    }
    if (zxcvbn(password).score < 1) {
      return 'Password strength must be 25% or higher.';
    }
    if (!validator.matches(password, /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)) {
      return 'Password must have at least one capital letter, one lower-case letter and one number.';
    }
    if (!validator.matches(password, /^[!"#$%&'()*+,-./:;<=>?@[\\\]^`{|}~\w\s]*$/)) {
      return 'Password accepts only these <a href="https://www.owasp.org/index.php/Password_special_characters">special characters</a>.';
    }
    return false;
  }

  function checkIfPasswordsMatch(password, confirmation) {
    if (validator.equals(password, confirmation)) {
      return false;
    }
    return 'Passwords must match.';
  }

  function passwordStrengthCalculator(e) {
    progress.progress({
      value: zxcvbn(e.target.value).score
    });
  }
}());
