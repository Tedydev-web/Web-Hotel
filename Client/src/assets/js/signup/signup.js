$(document).ready(function () {
  $("#check15").on('change', function () {
    console.log(123);
    if ($("#check15").is(":checked")) {
      $("#signup").removeClass("disabled");
    } else {
      $("#signup").addClass("disabled");
    }
  });
});
