var form = (function() {

  var cls = {};

  // Validate that the username is an email
  cls.validateInput = function () {
    this.userNameValue = this.el.username.value;
    this.passwordValue = this.el.password.value;
    this.userNameAcceptable = validator.isEmail(this.userNameValue);
    this.passwordAcceptable = this.passwordValue != null && this.passwordValue != "";
    return (this.userNameAcceptable && this.passwordValue != null && this.passwordValue != "");
  };

  // Get errors from input fields on form
  cls.getErrors = function () {
    var errorMessages = [];
    if (!this.userNameAcceptable) {
      this.userNameField.classList.add('error');
      this.showingErrors = true;
      errorMessages.push('Enter your email to login \n');
    }
    if (!this.passwordAcceptable) {
      this.passwordField.classList.add('error');
      this.showingErrors = true;
      errorMessages.push('Enter your password to login \n');
    }
    this.displayErrorBanner(errorMessages);
  };

    // Display info to the user
  cls.displayErrorBanner = function (errorMessages) {
    var self = this;
    this.bannerElement.innerHTML = '';
    errorMessages.forEach(function (message) {
      self.bannerElement.innerHTML += ('<p>' + message + '</p>');
    });
    this.bannerElement.classList.remove('success');
    this.bannerElement.classList.add('error');
    if (this.bannerElement.classList.contains('hidden')) {
      $(this.bannerElement).transition('fade down');
    }
  };

    // Handle callback related errors
  cls.handleLoginError = function (response) {
    this.clearLoading();
    var errorMessages = response.statusText || response.message;
    this.clearLoading();
    this.displayErrorBanner([errorMessages]);
  };

    // Clear error banner
  cls.clearErrors = function () {
    if (this.showingErrors) {
      this.userNameField.classList.remove('error');
      this.passwordField.classList.remove('error');
      this.showingErrors = false;
    }
  };

  // Show loading on button
  cls.showLoading = function () {
    this.buttonElement.classList.add('loading');
  };

  // Clear loading on button
  cls.clearLoading = function () {
    this.buttonElement.classList.remove('loading');
  };

  // Set events on the form (clear errors and catch submit)
  cls.setEvents = function () {
    this.el.addEventListener('submit', window.api.clickHandler.bind(this));
    this.el.username.addEventListener('keydown', this.clearErrors.bind(this));
    this.el.password.addEventListener('keydown', this.clearErrors.bind(this));
  };

  // Initialize form - formData is dom locations of form
  cls.init = function (formData) {
    this.formData = formData;
    this.min = formData.min || 8;
    this.max = formData.min || undefined;
    this.showingErrors = false;
    this.el = formData.formElement || document.getElementsByTagName('form')[0];
    this.userNameField = formData.userNameField || document.getElementById('username');
    this.passwordField = formData.passwordField || document.getElementById('password');
    this.buttonElement = formData.loginButton || document.getElementsByTagName('button')[0];
    this.bannerElement = formData.loginBanner || document.getElementsByClassName('message')[0];
    this.setEvents();
  };

  return cls
}());
// Kick off the form init sequence
document.addEventListener('DOMContentLoaded', function () {
  var formData = {
    formElement: document.querySelector('.login.form'),
    userNameField: document.querySelector('.username.field'),
    passwordField: document.querySelector('.password.field'),
    loginButton: document.querySelector('.login.button'),
    loginBanner: document.querySelector('.login.message')
  };
  form.init(formData);
});
