var api = (function () {

  var cls = {};

  // Fetch does not have built in timeouts
  cls.timeout = function (ms, promise) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject(new Error('Login timed out'));
      }, ms);
      promise.then(resolve, reject);
    });
  };

  cls.getParameterByName = function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

  // Button click handler to intercept form data
  cls.clickHandler = function (e) {
    var form = window.form;
    e.preventDefault();
    if (form.validateInput()) {
      form.showLoading();
      cls.postLogin(form.el)
        .catch(form.handleLoginError.bind(form));
      return true;
    }
    form.getErrors();
    return false;
  };

  // Post login info
  cls.postLogin = function(formElement) {
    var urlEncodedDataPairs = [];
    var urlEncodedData = "";
    urlEncodedDataPairs.push(encodeURIComponent('username') + '=' + encodeURIComponent(formElement.username.value));
    urlEncodedDataPairs.push(encodeURIComponent('password') + '=' + encodeURIComponent(formElement.password.value));
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    var nextQuery = cls.getParameterByName('next');
    var postUrl = formElement.action + (nextQuery != null ? '?next=' + nextQuery : '');

    return this.timeout(this.msTimeout,
      fetch(postUrl, {  // pass cookies, for authentication
        redirect: 'follow',
        credentials: 'same-origin',
        method: 'post',
        followAllRedirects: true,
        headers: {
          'Accept': '*',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Allow-Control-Allow-Origin': '*',
        },
        body: urlEncodedData
      }).then(this.getResponseBody)
        .then(this.handleResults.bind(this))
      );
  };

  cls.getResponseBody = function (response) {
    return response.json();
  };

  cls.handleResults = function (response) {
    var self = this;
    return new Promise(function (resolve, reject) {
      // Client side redirect
      if (response.redirected) {
        var username = document.getElementById('username').value;
        this.tracking.mixpanelApi.identify({
          UserName: username
        });
        this.tracking.TH.trackEvent('Logged In');
        window.location.href = response.callbackUrl;
      } else if (response.status !== 200) {
        reject(response);
      } else {
        resolve(response);
      }
    });
  };

  // Initialize login - formData is dom locations of form
  cls.init = function (formData) {
    this.msTimeout = form.msTimeout || 30000;
  };

  return cls;
}());

// Kick off the login sequence
document.addEventListener('DOMContentLoaded', function () {
  api.init(form.formData);
});
