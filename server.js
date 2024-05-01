// Extra Credit 1: 
  // The pros of using a databased include accurate data integration, scale, increassed security and effeciency and also allows mutiple users toa cces the information without corrupting the data. Data bases however are more complex than file-based storage. 
      // File based storage is simple, and give more control to the user in regards to specific and unusual data. This advantage however is offset by cons such as lack of ability to opearate with mutiple users, and it is harder to maintain the data.
    // In my application, using a database would be better, due to the future of this assigment, which will require that multiple users can access and interact with the page. This will require a structured database to keep the data intact, readable and retrievable.
// Extra Credit 2:
  // Did not use microservices to process login and registration

// Extra Credit 3:
  // No extra validation towards the email, however I included validation within the ZIP, Address and State.
    //ZIP code requires the user enter 5 values
    //State requires it is filled out(selection menu), along with address.

  // Extra Credit 4:
    // Was not able to implement this

  // Extra Credit 5:
    // Since I didn't have the encryption IR, a way that a user can defeat my security scheme is by lookin in the url, as my data is not encrypted. This could be done by someone on the same network, through a man in the middle attack, as the password is in plaintext. Also, the lack of cookies and sessions also increases vulnerability of the application.

    //Code rundown and overview
      // This assigment was difficult, however I had more confidence than in assigment one. First i started off with the login, which I found to be difficult. After looking at a couple of classmates codes before class, I attempted to use the various aspects I found to create mine. This did not prove to work, as their code, although similiar to mine, functioned in different ways, which did not fully create the functionality I needed.

      //After this inclusion of others successes in their webpages, I was left with a faulty and error prone document. It was after this where I decided to get help from Professor Port, in which he helped immensely. Lines 30 - 170 were  contributed to by professor port, in our meeting, in which he added the tmp_user_quantities, as well as formatting and fixing my code, which had many errors at the time.

      // To create and work on the registration, much help came from CHATGPT. Originally, I started with the variables I knew I would need and connceted them with the fields I knew contained them. From there, I explained in depth to CHAT gpt the requirements, variables and possible errors a user might need to be shown.
      // By doing this, I was able to create a rough outline of the if statements regarding registration validation. From there, sourced regex validation scripts for Kobo Toolbox (https://support.kobotoolbox.org/restrict_responses.html). Using chatgpt and the info I found from kobotoolbox, I was able to create specific validation scenarios regarding the registration form. From this point, it was fairly easy to use GPT to implement my zip, address and state validations, as those were quite simple and my chatgpt had become accustomed and used to the style of coding.

      // Examples of prompts I asked chatgpt, which I found to be helpful


// Load the products from a JSON file into a server-side memory object
const products = require(__dirname + '/products.json');

// Import the Express framework to facilitate API creation
const express = require('express');
const app = express(); // Create an Express application instance
let tmp_user_quantities = {}; // Temporary storage for user selected product quantities

// Import the filesystem module for file operations
const fs = require('fs');
const user_data_file = __dirname + '/user_data.json'; // Define the path for the user data file

// Check if the user data file exists and read it into memory
let users_reg_data = {}; // Initialize an object to store user data
if (fs.existsSync(user_data_file)) {
  const data = fs.readFileSync(user_data_file, 'utf-8'); // Synchronously read the file contents
  users_reg_data = JSON.parse(data); // Parse the JSON string into a JavaScript object
}
console.log(users_reg_data); // Log the loaded user data to the console for debugging

// Body-parser middleware to handle form submissions
const myParser = require("body-parser");
app.use(myParser.urlencoded({ extended: true }));

// Middleware to log all requests to the console
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path); // Log the method and path of each request
    next(); // Proceed to the next middleware or route handler
});

// Route handler for POST requests on the login endpoint
app.post("/process_login", function (request, response) {
  console.log(request.body); // Log the request body to the console
  let errors = {}; // Initialize an object to collect potential errors
  let email = request.body.email.toLowerCase(); // Normalize email to lower case
  let password = request.body.password; // Capture the password from the request

  const params = new URLSearchParams(); // Create a new URLSearchParams object
  params.append('email', email); // Append email to the query string parameters
  
  // Check if the provided email exists in the registered user data
  if (email in users_reg_data) {
      if (users_reg_data[email].password === password) { // Check if the provided password matches the stored password
          // Logic to handle correct login credentials
          tmp_user_quantities.forEach((quantity, i) => { // Reduce the available quantities of products based on user selection
              products[i].quantity_available -= quantity; // Subtract the quantity from the available stock
          });
          // Append additional user information to the query parameters
          params.append('username', encodeURIComponent(users_reg_data[email].username));
          params.append('address', encodeURIComponent(users_reg_data[email].address));
          params.append('zip', encodeURIComponent(users_reg_data[email].zip));
          params.append('state', encodeURIComponent(users_reg_data[email].state));
          params.append('quantities', JSON.stringify(tmp_user_quantities)); // Gather and append user data
          response.redirect('./invoice.html?' + params.toString()); // Redirect to the invoice page with query parameters and info, for personaliztion of invoice.
          return;
      } else {
          errors['wrong_password'] = 'Incorrect password, re-enter password correctly.'; // In event that user puts in an invalid password, the user will be notified of the error on the html.
      }
  } else {
      errors['no_user'] = `${email} not registered, please register to purchase!`; // Add registration error in event of a non-registered email, user is then told to register an account.
  }

  params.append('errors', JSON.stringify(errors)); // Append error information to the query parameters
  response.redirect('./login.html?' + params.toString()); // Redirect back to the login page with error parameters
});

app.post("/process_registration", function (request, response) {
  console.log(request.body); // Log the registration form data

  let errors = {}; // Initialize an object for potential registration errors
  let new_email = request.body.email ? request.body.email.toLowerCase() : ''; // Normalize the new email to lower case
  let new_username = request.body.username ; // Capture the new username
  let new_password = request.body.password ; // Capture the new password
  let password_confirmation = request.body.password_repeat ; // Capture the password confirmation
  let address = request.body.address ; // Capture the address
  let zip = request.body.zip ; // Capture the ZIP code
  let state = request.body.state ; // Capture the state

  // Validation checks for registration fields
  if (new_email in users_reg_data) {
      errors['email_taken'] = 'Email already registered'; // Check for email uniqueness. If email is found to already exist in users_reg_data, then an error is show to the user explaining the issue.
  }
  if (!new_email.match(/^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/)) {
      errors['invalid_email'] = 'Invalid email format'; // Check for valid email format, making sure it follows the format of example@example.xxx, In this validation, it allows all letters and numbers, as well as underscores and periods. Following the @, it only accepts letters and numbers. Finally, in the last section it allows users to only input up to three letters, with no characters or numbers. This is for endings of email such as .com, .edu, .org or .tv.
  }
  if (new_password.length < 10 || new_password.length > 16 || new_password.includes(' ')) {
      errors['invalid_password'] = 'Password must be between 10-16 characters long and cannot contain spaces.'; 
      // Check for password length and content. Must be over 10 letters, but under 16. Also cannot include spaces.
  }
  //IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||
  if (!new_password.match(/\d/) || !new_password.match(/[!@#$%^&*(),.?":{}|<>]/)) {
    errors['invalid_password'] = 'Password must include at least one number and one special character.'; 
    // Check for password complexity, making sure it has at least one number, and one special character. If not, user is told to input it again along with the specific error.
  //IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||IR#5||
  }
  if (new_password !== password_confirmation) {
      errors['password_mismatch'] = 'Passwords do not match'; // Check for password confirmation match between password, and password confirmation field. If not, tell the user that the passwords do not match.
  }
  if (!new_username.match(/^[a-zA-Z ]{2,30}$/)) {
      errors['invalid_username'] = 'Full name must be between 2 and 30 letters and only contain alphabetic characters'; // Check for valid username. Only allowed to contain alphabetic characters, which must be between 2 and 30 letters.
  }
  if (!address) {
    errors['address_required'] = 'Address is required.'; // Check for address presence, if not present, error will be displayed informing user that the address is a required box
  }
  if (!zip.match(/^\d{5}$/)) {
    errors['invalid_zip'] = 'ZIP code must be exactly 5 digits.'; // Check for valid ZIP code, if there is a five digit number, then it is counted as valid. This only applies to United States 5-digit ZIP codes.
  }
  if (!state) {
    errors['state_required'] = 'State is required.'; // Check for state presence. If user did select a state from the dropwon menu, continue. If not, tell user that the state field is required.
  }
// Check if any errors were collected during registration
  if (Object.keys(errors).length > 0) {
      let query = new URLSearchParams(errors).toString(); // Pack errors into query string
      response.redirect('/registration.html?' + query); // Redirect back to registration with errors inside query
  } else {
    //save user data regarding registration of new user
      users_reg_data[new_email] = {
          username: new_username,
          password: new_password, // plain text password
          address: address,
          zip: zip,
          state: state
      };
      fs.writeFileSync(user_data_file, JSON.stringify(users_reg_data)); // Write the updated user data to file

// Prep data so that it can be sent to the invoice for personaliztion
      const params = new URLSearchParams();
      params.append('email', new_email);
      params.append('username', encodeURIComponent(request.body.username));
      params.append('address', encodeURIComponent(request.body.address));
      params.append('zip', encodeURIComponent(request.body.zip));
      params.append('state', encodeURIComponent(request.body.state));
//Decrease product stock for any quantities entered by the user
      if (tmp_user_quantities && tmp_user_quantities.length > 0) {
          tmp_user_quantities.forEach((quantity, i) => {
              products[i].quantity_available -= quantity;
          });
          params.append('quantities', JSON.stringify(tmp_user_quantities));
      }//redirect to invoice containing all purchase and user data
      response.redirect('./invoice.html?' + params.toString());
  }
});

app.get('/products.json', function (request, response) {
    response.json(products); // Serve the products data as JSON
});

app.post('/process_purchase_form', function (request, response, next) {
  let errors = {}; // Object to collect errors related to product purchase
  let quantities = [];
  let hasPositiveQuantity = false; // Flag to check if at least one positive quantity was entered

  if (typeof request.body['quantity_textbox'] !== 'undefined') {
    quantities = request.body['quantity_textbox'];

    quantities.forEach((quantity, index) => {
      if (!isNonNegInt(quantity)) {
        errors['quantity' + index] = isNonNegInt(quantity, true).join('<br>'); // Validate each quantity
      }
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
    console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(request.body));
  }

  const params = new URLSearchParams();
  params.append('quantities', JSON.stringify(quantities));

  if(Object.keys(errors).length > 0) {
    params.append('errors', JSON.stringify(errors));
    response.redirect( 'store.html?' + params.toString());
  } else {
    tmp_user_quantities = quantities; // Store the quantities for later use
    response.redirect('./login.html');
  }
});

//Got help from chatgpt. Inputted all info to the chat, incluidng images of the errors, server.js and any other files which I deemed to be relevant so that the robot could have as much context as needed. At this point, I had the invoice page innaccesible to those who didnt log in, however I was facing issues with the tmp_user_quantities, as it was having issues logging in and processing the purchase after one tried to directly reach the invoice. This probably wasnt the best way to do it, however it patched an issue that I saw needed to be done.
// This allowed me to still login after trying to directly access the invoice and being redirected, as I had issues before due to the tmp_user_quantities. 
app.get('/login.html', function (req, res, next) {
  if ('quantities' in req.query) {
      tmp_user_quantities = JSON.parse(req.query.quantities);
      // Ensure tmp_user_quantities is an array
      if (!Array.isArray(tmp_user_quantities)) {
          tmp_user_quantities = []; // Reset to empty array if not array
      }
  }
  next();
});




app.use(express.static(__dirname + '/public')); // Serve static files from the 'public' directory
app.listen(8080, () => console.log(`listening on port 8080`)); // Start the server on port 8080

function isNonNegInt(q, returnErrors = false) {
  let errs = []; // Initialize an error list
  if(q == '') q = 0; // Treat empty input as zero
  if (Number(q) != q) errs.push('Not a number!'); // Check if the input is a number
  else {
    if (q < 0) errs.push('Negative value!'); // Ensure the number is non-negative
    if (parseInt(q) != q) errs.push('Not an integer!'); // Ensure the number is an integer
  }
  return returnErrors ? errs : (errs.length == 0); // Return errors if requested, otherwise return validity
}


//