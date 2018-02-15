const inquirer = require('inquirer');
let Table = require('cli-table2');
const connection = require('./query.js');

function displayInventory() {
  connection.query('SELECT * FROM products')
  .then((response) => {
    let head = [];
    response.fields.forEach(element => {
      head.push(element.name);
    })
    let table = new Table({
      head: head,
      style: { 'padding-left': 0, 'padding-right': 0 }
    })
    for (let i = 0; i < response.response.length; i++) {
      table.push([response.response[i].item_ID, response.response[i].product_name, response.response[i].department_name, response.response[i].price, response.response[i].stock_quantity, response.response[i].product_sales]);
    }
    console.log(table.toString());
    anotherTransactionPrompt();
  }).catch(err => console.log(err));
}

function anotherTransactionPrompt() {
  inquirer
  .prompt([
    {
      type: 'confirm',
      message: 'Would you like you to make a transaction?',
      name: 'transaction'
    }
  ]).then(answers => {
    if (answers.transaction) {
      promptPurchase();
    } else {
      connection.end();        
    }
  }).catch(err => console.log(err));
}

function promptPurchase() {
  inquirer
  .prompt([
    {
      type: 'input',
      message: 'Please enter the ID of the product you would like to buy?',
      name: 'id',
      validate: function(input) {
        if(!isNaN(input)) {
          return true;
        } else {
          console.log('Please enter a number.');
        }
      }
    },
    {
      type: 'input',
      message: 'How many would you like to buy?',
      validate: function(input) {
        if(!isNaN(input)) {
          return true;
        } else {
          console.log('Please enter a number.');
        }
      },
      name: 'quantity'
    }
  ]).then((answers) => {
    connection.query('SELECT * FROM products WHERE ?', [
      {
        item_ID: answers.id
      }
    ]).then(response => {
      if (response.response.length !== 0) {
        checkQuantity(response.response[0].stock_quantity, answers.quantity, response.response[0].price, answers.id, response.response[0].product_sales);
      } else {
        console.log("Sorry we couldn't find any product under that id");
        anotherTransactionPrompt();
      }
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));
}

function checkQuantity(currentQuantity, purchaseQuantity, productPrice, productID, oldSales) {
  if (Number(currentQuantity) - Number(purchaseQuantity) >= 0) {
    let purchaseTotal = productPrice * purchaseQuantity;
    let newSales = purchaseTotal + oldSales;
    console.log('Transaction successful!');
    console.log('Your total is: $' + purchaseTotal);
    let newQuantity = Number(currentQuantity) - Number(purchaseQuantity);
    connection.query('UPDATE products SET ? WHERE ?', [
      {
        stock_quantity: newQuantity,
        product_sales: newSales
      },
      {
        item_ID: productID
      }
    ]).then(response => displayInventory()).catch(err => console.log(err));
  } else {
    console.log('Insufficient quantity!');
    promptPurchase();          
  }
}
displayInventory();