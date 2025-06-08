import db from "../db/db.js"

const getUserFighters = async (userId) => {
    // JOIN's Fighters with User_fighters 
   const [rows] = await db.query(
   `SELECT fighters.id, fighters.name, fighters.type
       FROM fighters
       JOIN User_fighters ON fighters.id = User_fighters.fighter_id
       WHERE User_fighters.user_id = ?`,
   [userId]
   );
   return rows; 
}


const addUserFighter = async (userId, fighterId) => {
    if (!fighterId) {
        throw new Error("fighterId is required");
      }
      try {
        await db.execute(
          `INSERT INTO User_fighters (user_id, fighter_id) VALUES (?, ?)`,
          [userId, fighterId]
        );
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") { 
            const duplicateError = new Error("User already tracking this fighter");
            duplicateError.code = "DUPLICATE";
            throw duplicateError;
          }
        throw err;
      }
}

const deleteUserFighter = async (userId, fighterId) => {
  try {
    const [ result ] = await db.execute("DELETE FROM User_fighters WHERE user_id=(?) AND fighter_id=(?)", [userId, fighterId]);
    console.log(`Deleting Fighter ID: : ${fighterId}`, result);
    console.log("Affected rows is: ", result.affectedRows);
    
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error deleting fighter: ", err);
    throw err;
  }
}

export { getUserFighters, addUserFighter, deleteUserFighter };