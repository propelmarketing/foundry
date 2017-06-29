$("#forgotPasswordForm").submit(function(event) {
  event.preventDefault();
  const email = document.getElementById("username").value;

  // In case message was already shown
  $("#errorMsg").hide();
  $("#emailErrorMsg").hide();

  if(validator.isEmail(email)) {
    fetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email }),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(function (res) {
      return res.json();
    }).then(function (res) {
      if (res.status < 200 || res.status >=300) {
        var message = res.message || "An unknown error occurred while processing your request. Please try again in a few seconds. If this error persists, please contact a representative";
        $("#errorMsg").text(message);
        $("#errorMsg").toggle();
      } else {
        $("#passwordForm").toggle();
        $("#userEmail").text(res.email);
        $("#successMsg").toggle();
      }
    });
  } else {
    $("#emailErrorMsg").toggle();
    return false;
  }
});
