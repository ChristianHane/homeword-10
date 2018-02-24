const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',  
  user: 'root',
  password: '',
  database: 'bamazon'
})

module.exports = {
  query(query, values) {
    return new Promise((resolve, reject) => {
      connection.query(query, values, function(err, response, fields) {
        if (err) {
          console.log(err);
        }
        resolve({response: response, fields: fields});
      })
    })
  },
  end() {
   connection.end();
  }
}


