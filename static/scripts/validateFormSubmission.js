var api = (function() {
  var cls = {};

  // Button click handler to intercept form data
  cls.clickHandler = function (e) {
    var form = window.form;
    if (form.validateInput()) {
      form.showLoading();
      return true;
    }
    form.getErrors();
    return false;
  };
  return cls;
}());
