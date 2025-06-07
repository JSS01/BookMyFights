import express from "express"
import { getAllFighters } from "../controllers/FightersController.js";


const router = express.Router()



router.get("/", async (req, res) => {
    try {
        const rows = await getAllFighters();
        res.status(200).json({fighters: rows})
    } catch (err) {
        console.error('Error fetching ALL fighters:', err);
        res.status(500).json({ message: 'Server error getting fighters.' });
    }
})


export default router;