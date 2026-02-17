// Wait until the page content is fully loaded before running any scripts
document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the Registration page by looking for the registration form
  if (document.getElementById('regform')) {
    setupRegisterPage();
  }

  // Check if we are on the Order page by looking for the order form (action="/submit-order")
  if (document.querySelector('form[action="/submit-order"]')) {
    setupOrderPage();
  }

  // For the Home page (index.html), no special JavaScript needed for now
});



// Setup validation and behaviour for the Registration page
function setupRegisterPage() {
  const form = document.getElementById('regform');

  // Add event listener for when the user attempts to submit the registration form
  form.addEventListener('submit', function(event) {
    event.preventDefault();  // Stop form from submitting immediately so we can validate inputs

    let errors = [];

    // Check that the Name field is not empty
    const name = form.name.value.trim();
    if (!name) {
      errors.push('Name is required.');
    }

    // Check that the Email field is not empty and follows a valid format
    const email = form.email.value.trim();
    if (!email) {
      errors.push('Email is required.');
    } else if (!validateEmail(email)) {
      errors.push('Email format is invalid.');
    }

    // Check that the Password field is filled and at least 9 characters long
    const password = form.password.value;
    if (!password) {
      errors.push('Password is required.');
    } else if (password.length < 9) {
      errors.push('Password must be at least 9 characters long.');
    }

    // Check that the Postcode field is exactly 4 digits
    const postcode = form.postcode.value.trim();
    if (!postcode) {
      errors.push('Postcode is required.');
    } else if (!/^\d{4}$/.test(postcode)) {
      errors.push('Postcode must be exactly 4 digits.');
    }

    // Check that one of the Gender radio buttons is selected
    const gender = form.gender.value;
    if (!gender) {
      errors.push('Please select your gender.');
    }

    // Check that the Favourite Item field is not empty
    const favourite = form.favourite.value.trim();
    if (!favourite) {
      errors.push('Please enter your favourite item from the store.');
    }

    // Check that at least one Preferred Brewing Method checkbox is checked
    const brewMethods = form.querySelectorAll('input[name="brew_method"]:checked');
    if (brewMethods.length === 0) {
      errors.push('Please select at least one preferred brewing method.');
    }

    // Check that a Preferred Location is selected (should always have a default value)
    const location = form.location.value;
    if (!location) {
      errors.push('Please select a preferred location.');
    }

    // If there are any errors, show an alert with all error messages and prevent form submission
    if (errors.length > 0) {
      alert('Please fix the following errors before submitting:\n\n' + errors.join('\n'));
      return false;
    }

    // If no errors, allow form to be submitted
    form.submit();
  });
}

// Helper function to validate email address format using a basic regular expression
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Function to include highlighting of selected page
window.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const page = path.split("/").pop();

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    if (link.getAttribute("href") === page) {
      link.style.color = "#a0522d";
      link.style.textDecoration = "underline";
    }
  });
});



// Setup validation and interactive behaviour for the Order page
function setupOrderPage() {
  const form = document.querySelector('form[action="/submit-order"]');

  // Get references to radio buttons and form groups to show/hide
  const pickupRadio = document.getElementById('pickup');
  const deliveryRadio = document.getElementById('delivery');
  const deliveryAddressGroup = document.getElementById('deliveryAddressGroup');

  const payOnPickupRadio = document.getElementById('pay-pickup');
  const payOnlineRadio = document.getElementById('pay-online');
  const cardDetailsGroup = document.getElementById('cardDetailsGroup');

  // Function to show or hide delivery address field depending on order type selected
  function toggleDeliveryAddress() {
    if (deliveryRadio.checked) {
      deliveryAddressGroup.classList.remove('hidden');
      deliveryAddressGroup.querySelector('textarea').required = true;
    } else {
      deliveryAddressGroup.classList.add('hidden');
      deliveryAddressGroup.querySelector('textarea').required = false;
    }
  }

  // Function to show or hide credit card details depending on payment method selected
  function toggleCardDetails() {
    if (payOnlineRadio.checked) {
      cardDetailsGroup.classList.remove('hidden');
      cardDetailsGroup.querySelectorAll('input').forEach(input => input.required = true);
    } else {
      cardDetailsGroup.classList.add('hidden');
      cardDetailsGroup.querySelectorAll('input').forEach(input => input.required = false);
    }
  }

  // Attach change event listeners to radio buttons to dynamically toggle fields
  pickupRadio.addEventListener('change', toggleDeliveryAddress);
  deliveryRadio.addEventListener('change', toggleDeliveryAddress);
  payOnPickupRadio.addEventListener('change', toggleCardDetails);
  payOnlineRadio.addEventListener('change', toggleCardDetails);

  // Initialize field visibility when page loads
  toggleDeliveryAddress();
  toggleCardDetails();

  // Add form submission event listener to validate input fields before submitting
  form.addEventListener('submit', function(event) {
    event.preventDefault();  // Stop immediate submission for validation

    let errors = [];

    // Validate that an order type (Pick-up or Delivery) is selected
    if (!pickupRadio.checked && !deliveryRadio.checked) {
      errors.push('Please select an order type (Pick-up or Delivery).');
    }

    // If Delivery is selected, check that Delivery Address is filled out
    if (deliveryRadio.checked) {
      const deliveryAddress = deliveryAddressGroup.querySelector('textarea').value.trim();
      if (!deliveryAddress) {
        errors.push('Please enter your delivery address.');
      }
    }

    // Check that Billing Address is filled out
    const billingAddress = form.billing_address.value.trim();
    if (!billingAddress) {
      errors.push('Billing address is required.');
    }

    // Check that Contact Number is filled out and contains only allowed characters
    const contactNumber = form.contact_number.value.trim();
    if (!contactNumber) {
      errors.push('Contact number is required.');
    } else if (!/^[\d\s\-\+\(\)]+$/.test(contactNumber)) {
      errors.push('Contact number contains invalid characters.');
    }

    // Check that Email for receipt is filled out and is valid format
    const email = form.email.value.trim();
    if (!email) {
      errors.push('Email for receipt is required.');
    } else if (!validateEmail(email)) {
      errors.push('Email format is invalid.');
    }

    // Check that a payment method is selected
    if (!payOnPickupRadio.checked && !payOnlineRadio.checked) {
      errors.push('Please select a payment method.');
    }

    // If Pay Online is selected, validate credit card details
    if (payOnlineRadio.checked) {
      const cardNumber = form.card_number.value.trim();
      const cardExpiry = form.card_expiry.value.trim();
      const cardCvc = form.card_cvc.value.trim();

      // Credit card number must be 13 to 16 digits
      if (!cardNumber) {
        errors.push('Credit card number is required.');
      } else if (!/^\d{13,16}$/.test(cardNumber)) {
        errors.push('Credit card number must be 13 to 16 digits.');
      }

      // Expiry date must be in MM/YY format
      if (!cardExpiry) {
        errors.push('Credit card expiry date is required.');
      } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
        errors.push('Credit card expiry date must be in MM/YY format.');
      }

      // CVC must be 3 or 4 digits
      if (!cardCvc) {
        errors.push('Credit card CVC is required.');
      } else if (!/^\d{3,4}$/.test(cardCvc)) {
        errors.push('Credit card CVC must be 3 or 4 digits.');
      }
    }

    // If there are any errors, show all errors in an alert and prevent form submission
    if (errors.length > 0) {
      alert('Please fix the following errors before submitting:\n\n' + errors.join('\n'));
      return false;
    }

    // If all inputs are valid, submit the form
    form.submit();
  });
}
