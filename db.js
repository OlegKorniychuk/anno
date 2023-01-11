const mysql = require('mysql2');

module.exports = mysql.createPool({
  connectionLimit: 2,
  host: 'localhost',
  user: 'oleh',
  password: 'password',
  database: 'mydb'
})