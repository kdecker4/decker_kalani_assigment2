// get the query string into a easy to use object
const params = (new URL(document.location)).searchParams;
// Initialize an empty object to store error messages
let errors = {};
// Initialize an empty array to store product quantities

let quantities = [];

// check if the query string has errors, if so parse it
if (params.has('errors')) {
  errors = JSON.parse(params.get('errors'));
  // get the quantities also to insert into the form to make sticky
  quantities = JSON.parse(params.get('quantities'));
  // Put up an alert box if there are errors
  if ('noquantities' in errors) {
    alert(errors.noquantities);
  } else {
        // Display a general error message if there are other errors

    alert('Please fix the errors in the form and resubmit');
  } 

}
// Declare a variable to store products data

let products;
// Define an async function that loads when the window is loaded

window.onload = async function () {
  // use fetch to retrieve product data from the server
  // once the products have been successfully loaded and formatted as a JSON object
  // display the products on the page
  await fetch('products.json').then(await function (response) {
        // Check if the fetch request was successful
    if (response.ok) {
            // Parse the JSON response and then display the products

      response.json().then(function (json) {
        products = json;
        display_products();
      });
    } else {
            // Log an error message if the network request failed
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  });
}

// function to perform the filtering of the products
function myFunction() {
  var input, filter, ul, si, a, i, txtValue;
    // Get the user input from a textbox element
  input = document.getElementById("search_textbox");
    // Convert the input text to uppercase to make the search case-insensitive
  filter = input.value.toUpperCase();
    // Get all section elements that contain product information
  si = document.getElementsByTagName("section");
    // Loop through all sections to filter visible products
  for (i = 0; i < si.length; i++) {
        // Get the h2 element which is expected to contain the product name

    a = si[i].getElementsByTagName("h2")[0];
        // Get the text value of the product name element
    txtValue = a.textContent || a.innerText;
        // Check if the product name contains the filter text and adjust display style accordingly
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      si[i].style.display = "";
    } else {
      si[i].style.display = "none";
    }
  }
}

// Define a function to display products on the page
function display_products() {
  // loop through the products array and display each product as a section element
  for (let i = 0; i < products.length; i++) {
    let quantity_label = 'Quantity';
    // if there is an error with this quantity, put it in the label to display it
    if ((typeof errors['quantity' + i]) != 'undefined') {
      quantity_label = `<font class="error_message">${errors['quantity' + i]}</font>`;
    }
    let quantity = 0;
    // put previous quantity in textbox if it exists
    if ((typeof quantities[i]) != 'undefined') {
      quantity = quantities[i];
    }
        // Construct HTML content for each product using template literals
    products_main_display.innerHTML += `
    <div class="w3-row-padding">
<section class="item">
<div class="w3-container w3-white">
                <h2><b>${products[i].name}</b></h2> <h4><b>${products[i].scientificname}</b></h4>
              </div>
                <h3><p><b>$${products[i].price.toFixed(2)}</b></p></h3>
                <h4><p><b>Quantity Available:${products[i].quantity_available}</b></p></h4>

                <label><b>${quantity_label}</b></label>

                <div class="w3-row-padding">
                <input class="w3-input w3-border type="text" placeholder="0" name="quantity_textbox[${i}]" value="${quantity}">
                </div>

                <div class="w3-third w3-container w3-margin-bottom">
                <img src="./images/${products[i].image}">
                </div>
                
                <h5><p><b>Info:${products[i].information}</b></p></h5>
                
            </section>
`;
  }
}