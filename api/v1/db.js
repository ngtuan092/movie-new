const mysql = require('mysql2')
require('dotenv').config()
// create the connection to database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'movienew',
    database: process.env.DB_NAME || 'movie_new',
    password: process.env.DB_PASS || 'Movienew'
});
const query = (query, args = []) =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      connection.query(query, args, (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });

module.exports = { query };