from datetime import datetime
from typing import List
from fastapi import FastAPI, HTTPException
from ufc import *
from constants import *
from pydantic import BaseModel
import asyncio

# Create the app
app = FastAPI(
    title="BookMyFightsScraper",
    description="An API to scrape upcoming fights from the official UFC website.",
    version="1.0.0"
)
# Create an instance of the scraper 
ufc_scraper = UFCScraper(BASE_UFC_URL)


class FightResponse(BaseModel):
    event_title: str 
    fighters: List[str]
    date_time: datetime
    venue: str
    location: str

class FighterListRequest(BaseModel):
    fighters: List[str]


# Routes 
@app.get("/")
def root():
    return {"Hello" : "World"}

@app.get("/UFC/fights", summary="Get all upcoming UFC fights", response_model=List[FightResponse])
async def get_all_ufc_fights():
    try:
        fights = await asyncio.to_thread(ufc_scraper.get_all_upcoming_fights)
        return fights 
    except UFCScraperException as e:
        raise HTTPException(status_code=503, detail=f"UFC Scraper service failed: {e}") 

@app.post("/UFC/upcoming-fights", summary="Get upcoming fights for the given fighters", response_model=dict[str, FightResponse])
async def get_upcoming_fights(request: FighterListRequest):
    try:
        upcoming_fights = await asyncio.to_thread(ufc_scraper.get_upcoming_fights_for, request.fighters)
        return upcoming_fights
    except UFCScraperException as e:
        raise HTTPException(status_code=503, detail=f"UFC Scraper service failed: {e}") 
