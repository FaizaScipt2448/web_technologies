$(document).ready(function() {

  // Show/Hide card fields when "Card" is selected
  $("input[name='payment']").change(function() {
    if ($(this).val() === "card") {
      $(".card-fields").show();
    } else {
      $(".card-fields").hide();
    }
  });

  $("#checkoutForm").submit(function(e) {
    e.preventDefault(); // stop form from refreshing

    let valid = true;
    $(".error").text(""); // clear old errors

    // Full Name
    const fullname = $("#fullname").val().trim();
    if (fullname.length < 3) {
      $("#fullname").next(".error").text("Full name must be at least 3 characters.");
      valid = false;
    }

    // Email
    const email = $("#email").val().trim();
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(email)) {
      $("#email").next(".error").text("Enter a valid email address.");
      valid = false;
    }

    // Phone
    const phone = $("#phone").val().trim();
    const phonePattern = /^[0-9]{10,}$/;
    if (!phonePattern.test(phone)) {
      $("#phone").next(".error").text("Phone must be digits only, at least 10 numbers.");
      valid = false;
    }

    // Address
    if ($("#address").val().trim() === "") {
      $("#address").next(".error").text("Address is required.");
      valid = false;
    }

    // City
    if ($("#city").val().trim() === "") {
      $("#city").next(".error").text("City is required.");
      valid = false;
    }

    // Postal Code
    const postal = $("#postal").val().trim();
    const postalPattern = /^[0-9]{4,6}$/;
    if (!postalPattern.test(postal)) {
      $("#postal").next(".error").text("Postal code must be 4–6 digits.");
      valid = false;
    }

    // Country
    if ($("#country").val() === "") {
      $("#country").next(".error").text("Please select a country.");
      valid = false;
    }

    // Payment Method
    const payment = $("input[name='payment']:checked").val();
    if (!payment) {
      $("input[name='payment']").last().next(".error").text("Select a payment method.");
      valid = false;
    }

    // Card fields (only if card selected)
    if (payment === "card") {
      const cardNum = $("#cardNumber").val().trim();
      if (cardNum.length < 8) {
        $("#cardNumber").next(".error").text("Enter a valid card number (8+ digits).");
        valid = false;
      }
    }

    // Terms Checkbox
    if (!$("#terms").is(":checked")) {
      $("#terms").next(".error").text("You must agree before submitting.");
      valid = false;
    }

    // If all valid
    if (valid) {
      $("#successMsg").show();
      $("html, body").animate({ scrollTop: $("#successMsg").offset().top }, 400);
    } else {
      $("#successMsg").hide();
    }
  });
});
