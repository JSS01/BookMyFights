// server/db/db.js
import mysql from 'mysql2/promise';


const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'me',           // I created this user
  password: 'classic1jake', // I made this password 
  database: 'BookMyFight', // Name I chose for the db
});

console.log('✅ MySQL connected');



export default connection;
