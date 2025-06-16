import express from 'express'
import protect from './authMiddleware.js';
import { google } from 'googleapis';
import { getUpcomingFights, addEventToCalendar, createCalendarEvent } from '../controllers/CalendarController.js';

const router = express.Router();


router.post("/sync-fights", protect, async (req, res) => {
    try {
        // Should be available from the middleware
        const userId = req.user.userID;
        // Access token for google api
        const { accessToken } = req.body;
        // Get fights to be synced
        const fights = await getUpcomingFights(userId);

        // Create OAuth2 Client 
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
    
        const insertedEvents = [];
        for (const [fighterName, fight] of Object.entries(fights)) {
            const event = createCalendarEvent(fighterName, fight)            
            const addedEvent = await addEventToCalendar(auth, event)
            insertedEvents.push(addedEvent)
        }

        console.log("Inserted Events: ", insertedEvents)
        res.status(201).json({ message: 'Events synced to Google Calendar.', events: insertedEvents });

    } catch (err) {
        console.error('Error with syncing fights', err.message);
        res.status(500).json({ message: 'Server error syncing fights.' });
    }
});


export default router