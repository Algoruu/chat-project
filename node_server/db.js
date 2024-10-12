const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password : 'root',
  database: 'chat_app',
  dateStrings : true
});

db.connect((err) => {
  if (err) {
    console.error('MySQL에 연결하는 중 오류 발생:', err);
    throw err;
  }
  console.log('MySQL 연결 성공');
});

module.exports = db;
