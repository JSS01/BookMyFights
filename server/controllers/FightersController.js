import db from "../db/db.js"



const getAllFighters = async () => {
    const [ rows ] = await db.query("SELECT * FROM FIGHTERS")
    return rows;
}


export { getAllFighters }
