const inquirer = require('inquirer');
let Table = require('cli-table2');
const connection = require('./query.js');

function prompt() {
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'Choose one of the following options:',
      choices: ['View Product Sales by Department', 'Create New Department', 'Exit'],
      name: 'choice'
    }
  ]).then(answer => {
    if (answer.choice === 'View Product Sales by Department') {
      productSales();
    } else  if (answer.choice === 'Create New Department'){
      createDepartment();
    } else {
      connection.end();
    }
  }).catch(err => console.log(err));
}

function productSales() {
  connection.query('SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS product_sales, (SUM(products.product_sales) - departments.over_head_costs) AS sales_profit FROM departments LEFT JOIN products ON products.department_name = departments.department_name GROUP BY departments.department_id, departments.department_name, departments.over_head_costs')
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
      table.push([response.response[i].department_id, response.response[i].department_name, response.response[i].over_head_costs, response.response[i].product_sales, response.response[i].sales_profit]);
    }
    console.log(table.toString());
    prompt();
  }).catch(err => console.log(err));
}

function createDepartment() {
  inquirer
  .prompt([
    {
      type: 'input',
      message: 'What would you like to name the new department?',
      name: 'departmentName',
      validate: function(input) {
        if(isNaN(input)) {
          return true;
        } else {
          console.log('\nPlease enter only letters for the name.');
        }
      }
    },
    {
      type: 'input',
      message: 'What are the starting over head costs of the new department?',
      name: 'overHead',
      validate: function(input) {
        if(!isNaN(input)) {
          return true;
        } else {
          console.log('\nPlease enter just a number (ex: $2,000 enter: 2000)');
        }
      }
    }
  ]).then(answers => {
    connection.query('INSERT INTO departments SET ?', [
      {
        department_name: answers.departmentName,
        over_head_costs: answers.overHead
      }
    ]).then(() => {
      prompt();
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));
}
prompt();