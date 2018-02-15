const inquirer = require('inquirer');
let Table = require('cli-table2');
const connection = require('./query.js');

const choices = ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'exit'];

function prompt() {
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'Please choose one of the following options:',
      choices: choices,
      name: 'command'
    }
  ]).then(answer => {
    switch(answer.command) {
      case choices[0]:
        viewProducts();
        break;
      case choices[1]:
        lowInventory();
        break;
      case choices[2]:
        addInventory();
        break;
      case choices[3]:
        addProduct();
        break;
      case choices[4]:
        connection.end();
        break;
      default:
        console.log('Something went wrong, please try again!');
        prompt();
        break;
    }
  }).catch(error => console.log(error));
}

function viewProducts() {
  connection.query('SELECT * FROM products')
  .then(response => {
    let table = new Table({
      head: [response.fields[0].name, response.fields[1].name, response.fields[2].name, response.fields[3].name, response.fields[4].name, response.fields[5].name],
      style: { 'padding-left': 0, 'padding-right': 0 }
    })
    for (let i = 0; i < response.response.length; i++) {
      table.push([response.response[i].item_ID, response.response[i].product_name, response.response[i].department_name, response.response[i].price, response.response[i].stock_quantity, response.response[i].product_sales]);
    }
    console.log(table.toString());
    prompt();
  }).catch(err => console.log(err));
}

function lowInventory() {
  connection.query('SELECT * FROM products WHERE stock_quantity < 5')
  .then((response) => {
    let table = new Table({
      head: [response.fields[0].name, response.fields[1].name, response.fields[2].name, response.fields[3].name, response.fields[4].name, response.fields[5].product_sales],
      style: { 'padding-left': 0, 'padding-right': 0 }
    })
    for (let i = 0; i < response.length; i++) {
      table.push([response.response[i].item_ID, response.response[i].product_name, response.response[i].department_name, response.response[i].price, response.response[i].stock_quantity, response.reponse[i].product_sales]);
    }
    console.log(table.toString());
    if(response.length === 0) {
      console.log('\nThere is no low inventory.\n');
    }
    prompt();
  }).catch(err => console.log(err));
}

function addInventory() {
  inquirer
  .prompt([
    {
      type: 'input',
      message: 'What item ID would you like to add product to?',
      name: 'product',
      validate: function(input) {
        if(!isNaN(input) && input.length > 0) {
          return true;
        } else {
          console.log('\nPlease enter a number.');
        }
      }
    },
    {
      type: 'input',
      message: 'Please enter the quantity you would like to add to the inventory?',
      name: 'amount',
      validate: function(input) {
        if(!isNaN(input) && input.length > 0) {
          return true;
        } else {
          console.log('\nPlease enter a number.');          
        }
      }
    }
  ]).then(answers => {
    connection.query('SELECT * FROM products WHERE ?', [
      {
        item_ID: answers.product,
      }
    ]).then((response) => {
      if(response.response.length === 0) {
        console.log('\nThere was no product found under that ID');
        prompt();
      } else {
        connection.query('UPDATE products SET ? WHERE ?', [
          {
            stock_quantity: Number(response.response[0].stock_quantity) + Number(answers.amount)
          },
          {
            item_ID: answers.product
          }
        ]).then((response) => {
          viewProducts();
        }).catch(err => console.log(err));
      }
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));
}

function addProduct() {
  inquirer
  .prompt([
    {
      type: 'input',
      message: 'What is the name of the product you would like to add?',
      name: 'productName',
      validate: function(input) {
        if(isNaN(input) && input.length > 0) {
          return true;
        } else {
          console.log('\nProduct name can only be letters.');
        }
      }
    },
    {
      type: 'input',
      message: 'What department would you like to add that product to?',
      name: 'department',
      validate: function(input) {
        if(isNaN(input) && input.length > 0) {
          return true;
        } else {
          console.log('\nProduct name can only be letters.')
        }
      }
    },
    {
      type: 'input',
      message: 'What is the price of the item?',
      name: 'price',
      validate: function(input) {
        if(!isNaN(input) && input.length > 0) {
          return true;
        } else {
          console.log('\nPrice must be a number.');          
        }
      }
    },
    {
      type: 'input',
      message: 'Please enter the quantitiy you would like to add for the product',
      name: 'quantity',
      validate: function(input) {
        if(!isNaN(input) && input.length > 0) {
          return true;
        } else {
          console.log('\nQuantity must be a number.');
        }
      }
    }
  ]).then(answers => {
    connection.query('INSERT INTO products SET ?', [
      {
        product_name: answers.productName,
        department_name: answers.department,
        price: answers.price,
        stock_quantity: answers.quantity
      }
    ]).then((response) => {
      prompt();
    })
  }).catch(err => console.log(err))
}
prompt();