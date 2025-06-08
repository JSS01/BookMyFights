import express from "express";
import protect from "./authMiddleware.js"
import { getUserFighters, addUserFighter, deleteUserFighter } from "../controllers/UserFighterControllers.js";
const router = express.Router();


// Get list of fighters
router.get("/", protect, async (req, res) => {
    try {
        // Should be available from the middleware
        const userId = req.user.userID;
        const fighters = await getUserFighters(userId);
        res.json({ fighters });
    } catch (err) {
      console.error('Error fetching user fighters:', err);
      res.status(500).json({ message: 'Server error getting fighters.' });
    }})

// Add a fighter
router.post("/", protect, async (req, res) => {
    try {
      const userId = req.user.userID; 
      const { fighterId } = req.body;    
      await addUserFighter(userId, fighterId);
      res.status(201).json({ message: "Fighter added to user's list" });
    } catch (err) {
      if (err.code == "DUPLICATE") {
        res.status(409).json({ message: err.message });
      } else {
        console.error(err)
        res.status(500).json({ message: "Internal server error adding fighter to user list" });
      }
    }})

// Delete a fighter 
router.delete("/", protect, async (req, res) => {
  try {
    const userId = req.user.userID; 
    const { fighterId } = req.body;  
    const didDelete = await deleteUserFighter(userId, fighterId);
    console.log("DidDelete is: ", didDelete)
    if (didDelete) {
      res.status(201).json({ message: "Fighter deleted from user's list" });
    } else {
      res.status(404).json({ message: "User-fighter pair not found"});
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error deleting fighter from user list" });
  }})


export default router;


