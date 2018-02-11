const inquirer = require('inquirer');
const mysql = require('mysql');
let Table = require('cli-table2');
const connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',  
  user: 'root',
  password: 'milesparker7',
  database: 'bamazon'
})

function displayInventory() {
  new Promise((resolve, reject) => {
    connection.query('SELECT * FROM products', function(err, response, fields) {
      let table = new Table({
        head: [fields[0].name, fields[1].name, fields[2].name, fields[3].name, fields[4].name],
        style: { 'padding-left': 0, 'padding-right': 0 }
      })
      for (let i = 0; i < response.length; i++) {
        table.push([response[i].item_ID, response[i].product_name, response[i].department_name, response[i].price, response[i].stock_quantity]);
      }
      console.log(table.toString());
      resolve();
    })
  }).then(() => {
    anotherTransactionPrompt();
  })
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
  })
}

function promptPurchase() {
  inquirer
  .prompt([
    {
      type: 'input',
      message: 'Please enter the ID of the product you would like to buy?',
      name: 'id',
      validate: function(input) {
        if(typeof input === 'number') {
          console.log('Please enter a number.');
          return false;
        } else {
          return true;
        }
      }
    },
    {
      type: 'input',
      message: 'How many would you like to buy?',
      validate: function(input) {
        if(typeof input === 'number') {
          console.log('Please enter a number.');
          return false;
        } else {
          return true;
        }
      },
      name: 'quantity'
    }
  ]).then((answers) => {
    connection.query(`SELECT * FROM products WHERE item_ID = ${answers.id}`, function(err, response, fields) {
      if (!err) {
        checkQuantity(response[0].stock_quantity, answers.quantity, response[0].price, answers.id);
      } else {
        console.log(err);
      }
    }) 
  })
}

function checkQuantity(currentQuantity, purchaseQuantity, productPrice, productID) {
  if (Number(currentQuantity) - Number(purchaseQuantity) >= 0) {
    console.log('Transaction successful!');
    console.log('Your total is: $' + (productPrice * purchaseQuantity));
    let newQuantity = Number(response[0].stock_quantity) - Number(purchaseQuantity);
    connection.query(`UPDATE products SET stock_quantity = ${newQuantity} WHERE item_ID = ${productID}`, function(err, response, fields) {
      displayInventory();               
    })
  } else {
    console.log('Insufficient quantity!');
    promptPurchase();          
  }
}
displayInventory();