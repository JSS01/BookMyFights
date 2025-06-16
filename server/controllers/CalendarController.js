import { getUserFighters } from "./UserFighterControllers.js"
import axios from "axios"
import crypto from "crypto"
import { google } from "googleapis";

// Calendar API 
const calendar = google.calendar('v3');


// Returns list of upcoming fights for the user's tracked fighters
const getUpcomingFights = async (userId) => {
    // Get user's tracked fighters (boxing or UFC)
    const trackedFighters = await getUserFighters(userId) 
    const ufcFighterNames = trackedFighters.filter((fighter) => fighter.type === "ufc").map((fighter) => fighter.name)
    const boxingFighterNames = trackedFighters.filter((fighter) => fighter.type === "boxing").map((fighter) => fighter.name)


    // Make request to UFC web scraper api 
    const upcomingUFCFights = await axios.post(
        "http://localhost:8000/UFC/upcoming-fights",
        {"fighters" : ufcFighterNames}
    )
    // Make request to Boxing web scraper api 
    const upcomingBoxingFights = await axios.post(
        "http://localhost:8000/boxing/upcoming-fights",
        {"fighters" : boxingFighterNames}
    )
    // Combine fights
    return {...upcomingBoxingFights.data, ...upcomingUFCFights.data}
}

const createCalendarEvent = (fighterName, fight) => {
    const startTime = new Date(fight.event.date);
    // Set end time to 2hrs later
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); 
    const event = {
        summary: `${fight.fighters.join(" vs ")}`,
        location: fight.event.location,
        description: `\nTracked fighter: ${fighterName}`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
    };

    return event
}

const addEventToCalendar = async (auth, event) => {
    try {
        const response = await calendar.events.insert({
            auth,
            calendarId: 'primary',
            requestBody: event,
        });
        return event;
    } catch (error) {
        console.error(`Failed to insert event: ${event.summary}, ${error.message}`);
        }
    }



export { getUpcomingFights, createCalendarEvent, addEventToCalendar }