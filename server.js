// loads the products array into server memory from the products.json file
const products = require(__dirname + '/products.json'); // load the products.json file into memory
const express = require('express');
const app = express();

// redirect to invoice if quantities are valid, otherwise redirect back to products_display
  const fs = require('fs');
  
  const user_data_file = __dirname + '/user_data.json';
  // check that user data file exists and red in if it does
  let users_reg_data = {};

  if(fs.existsSync(user_data_file)) {
  const data = fs.readFileSync(user_data_file, 'utf-8');
   users_reg_data = JSON.parse(data);
  const stats = fs.statSync(user_data_file);
  console.log(`${user_data_file}has ${stats.size} characters`);
  }
  console.log(users_reg_data);


  
// This processes the form data in a POST request so that the form data appears in request.body
const myParser = require("body-parser");
app.use(myParser.urlencoded({ extended: true }));

app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});


app.get('/login.html', function (request, response, next) {
    console.log(request.query);
    if ('quantities' in request.query) {
        quantities = JSON.parse(request.query.quantities);
    }
    next(); // Typically, you would serve the login page here
});

app.post("/process_login", function (request, response) {
  console.log(request.body);
  let errors = {};
  let email = request.body.email.toLowerCase();
  let password = request.body.password;

  const params = new URLSearchParams();
  params.append('email', email); // Add logged-in user's email to query string

  if (email in users_reg_data) {
      if (users_reg_data[email] && users_reg_data[email].password === password) {
          // Assuming 'quantities' should be handled elsewhere
          response.redirect('./store.html?email=' + encodeURIComponent(email));
      } else {
          errors['wrong_password'] = 'Incorrect password';
          response.redirect('./login.html?email=' + encodeURIComponent(email) + '&error=' + encodeURIComponent(errors['wrong_password']));
      }
  } else {
      errors['no_user'] = `${email} not registered`;
      response.redirect('./login.html?error=' + encodeURIComponent(errors['no_user']));
  }
});



// Log requests to the console
app.all('*', function (request, response, next) {
  console.log(request.method + ' to ' + request.path);
  next();
});


app.post("/process_registration", function (request, response) {
  // Process login form POST and redirect to logged in page if ok, back to login page if not
  console.log(request.body);
  let errors = {};
  let new_email = request.body.email.toLowerCase();
  
 users_reg_data[new_email] = {};
 users_reg_data[new_email].username = request.body.username;
 users_reg_data[new_email].password = request.body.password;
// validate registration data

if (new_email.match(users_reg_data)) {
  errors['invalid_email'] = 'Invalid email format';
} else if (email in users_reg_data) {
  errors['email_taken'] = 'Email already registered';
}

// is email already registered?

// password correct format
if (!request.body.psw || request.body.psw.length < 10 || request.body.psw.length > 16) {
  errors['invalid_password'] = 'Password should be between 10 and 16 characters';
}
// password and password repeat match
if (request.body.psw !== request.body.psw_repeat) {
  errors['password_mismatch'] = 'Passwords do not match';
}
// validate full name
// if errors, send back to registration
if(Object.keys(errors).length !== 0) {
  response.redirect('/registration.html');
} else { 
// data valid, so add new user to users_reg_data

// save data to user_data_file
fs.writeFileSync(user_data_file,JSON.stringify(users_reg_data));
// reduce inventory 
// send to invoice

 response.redirect('./invoice.html');
}


});


app.get('/products.json', function (request, response) {
    response.json(products);
});
app.post('/process_purchase_form', function (request, response, next) {
  let errors = {}; // assume no errors to start
  let quantities = [];
  let hasPositiveQuantity = false;

  if (typeof request.body['quantity_textbox'] !== 'undefined') {
    quantities = request.body['quantity_textbox'];

    quantities.forEach((quantity, index) => {
      // Check if the quantity is a non-negative integer.
      if (!isNonNegInt(quantity)) {
        errors['quantity' + index] = isNonNegInt(quantity, true).join('<br>');
      }
      // Check if the quantity is greater than zero and less than or equal to the quantity available.
      else if (quantity > 0) {
        hasPositiveQuantity = true;

        if (quantity > products[index].quantity_available) {
          errors['quantity' + index] = `Insufficient stock for ${products[index].name}, only ${products[index].quantity_available} left.`;
        }
      }
    });
    
    if (!hasPositiveQuantity) {
      errors['noquantities'] = 'You must purchase at least one valid item.';
    }
    // This just logs the purchase data to the console and where it came from. It is not required.
    console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(request.body));
  }

  // create a query string with data from the form
  const params = new URLSearchParams();
  params.append('quantities', JSON.stringify(quantities));

  // If there are errors, send user back to fix otherwise redirect to invoice with the quantities in the query string
  if(Object.keys(errors).length > 0) {
    // Have errors, redirect back to store where errors came from to fix and try again
    params.append('errors', JSON.stringify(errors));
    response.redirect( 'store.html?' + params.toString());
  } else {
    // Reduce the quantities of each product purchased from the quantities available
  quantities.forEach((quantity, i) => {
    products[i].quantity_available -= quantity;
  });

    response.redirect('./invoice.html?' + params.toString());
  }

});

// This adds middleware to serve files from the public directory
app.use(express.static(__dirname  + '/public'));
app.listen(8080, () => console.log(`listening on port 8080`));


function isNonNegInt(q, returnErrors = false) {
  let errs = []; // assume no errors at first
  if(q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) errs.push('Not a number!'); // Check if string is a number value
  else {
    if (q < 0) errs.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errs.push('Not an integer!'); // Check that it is an integer
  }
  return returnErrors ? errs : (errs.length == 0);
}