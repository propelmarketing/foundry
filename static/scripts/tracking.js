/* eslint-disable */
var tracking = (function () {

  var eventWhiteList = [
    'Logged In'
  ];

  var mixpanelApi = {
    identify: function (user, account) {
      var account = account ? account : {};
      var user = user ? user : {};
      var plan = '';
      if (Object.keys(user).length) {
        // todo: update this so it aliases the email if it changes,
        // rather than creating a new profile
        mixpanel.identify(user.UserName);

        var fullName = user.FullName && user.FullName.trim();

        mixpanel.name_tag(fullName);

        mixpanel.people.set({
          'Company': account.CompanyName,
          '$first_name': user.FirstName,
          '$last_name': user.LastName,
          '$username': user.UserName,
          '$email': user.UserName,
          'Industry': account.Type,
          'Plan': plan,
          'Billing Status': account.BillingStatus,
          'User Role': user.Roles && user.Roles[0],
          'Coach Name': account.CoachName
        });

        mixpanel.people.set_once({
          '$created': account.CreatedDate
        });
      }
    }
  };

  var TH = {
    trackEvent: function (name, data, callback) {
      var promises = [];

      (function () {
        var value;
        var mixpanelonly;

        if (data) {
          value = data.value;
          mixpanelonly = data.mixpanelonly;
        } else {
          value = null;
          mixpanelonly = false;
        }

      })();

      if (typeof mixpanel !== 'undefined') {

        var promise = $.Deferred();
        promises.push(promise);

        var trackAsPeopleProp = eventWhiteList.indexOf(name.trim()) > -1;

        if (trackAsPeopleProp) {
          // Chain them using callbacks so the promise is resolved after both are done
          mixpanel.people.set_once("First Time: " + name, new Date(), function () {
            mixpanel.track(name, data, promise.resolve);
          });
        } else {
          mixpanel.track(name, data, promise.resolve);
        }
      }

      return $.when.apply($, promises)
        .then(callback);
    }
  }

  return {
    mixpanelApi,
    TH: TH
  };

}());
