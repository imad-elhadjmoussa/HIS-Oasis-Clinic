require('dotenv').config();

// const mysql = require('mysql2');

// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'imad123',
//     database: 'oasisclinic2'
// }).promise();


// db/connection.js
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'oasisclinic',
  password: 'Elhou1234@',
  timezone: '+01:00'
});

module.exports = db;

// db.connect(err => {
//     if (err) {
//         console.error('Database connection failed:', err.stack);
//         return;
//     }
//     console.log('MySQL Connected');
// });

// module.exports = db;