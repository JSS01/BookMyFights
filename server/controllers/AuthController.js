import db from "../db/db.js"

async function createUser(email, name) {
    try {
      //Check for email in db, create one if necessary, return 
      const [rows] = await db.query("SELECT * FROM Users WHERE email = ?", [email])
      let user;
      if (rows.length == 0) {
        console.log("No user with email (will create now): ", email);
        const [res] = await db.query("INSERT INTO Users (email, name) VALUES (?, ?)", [email, name]);
        user = { id: res.insertId, email, name };
      } else {
        user = rows[0]
        console.log("Already have a user with email, didnt create: ", email); 
      }
      return user 
    } catch (err) {
      console.error('Database error:', err);
      return { success: false, error: err.message };
    }
  }

export {createUser}