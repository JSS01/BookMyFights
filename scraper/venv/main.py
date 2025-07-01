from datetime import datetime
from typing import List
from fastapi import FastAPI, HTTPException
from ufc import *
from boxing import *
from constants import *
from pydantic import BaseModel
import asyncio
from cachetools.func import ttl_cache


# Create the app
app = FastAPI(
    title="BookMyFightsScraper",
    description="An API to scrape upcoming fights from either the UFC or boxing",
    version="1.0.0"
)
# Create scraper instances
UFC_SCRAPER = UFCScraper(BASE_UFC_URL)
BOXING_SCRAPER = BoxingScraper(BASE_BOXING_URL)


# Models for requests and responses 
class EventResponse(BaseModel):
    date: datetime
    location: str

class FightResponse(BaseModel): 
    fighters: List[str]
    event: EventResponse

class FighterListRequest(BaseModel):
    fighters: List[str]

# Cached scraper functions 
@ttl_cache(maxsize=1, ttl=CACHE_TTL)
def cached_get_all_ufc_fights():
    return UFC_SCRAPER.get_all_upcoming_fights()

@ttl_cache(maxsize=128, ttl=CACHE_TTL)
def cached_get_upcoming_ufc_fights(fighters_key: tuple[str]):
    all_fights = cached_get_all_ufc_fights()
    return UFC_SCRAPER.filter_fights_for(all_fights, list(fighters_key))


@ttl_cache(maxsize=1, ttl=CACHE_TTL)
def cached_get_all_boxing_fights():
    return BOXING_SCRAPER.get_all_upcoming_fights()


@ttl_cache(maxsize=128, ttl=CACHE_TTL)
def cached_get_upcoming_boxing_fights(fighters_key: tuple[str]):
    all_fights = cached_get_all_boxing_fights()
    return BOXING_SCRAPER.filter_fights_for(all_fights, list(fighters_key))

# API Routes 
@app.get("/")
def root():
    return {"Hello" : "World"}

@app.get("/UFC/fights", summary="Get all upcoming UFC fights", response_model=List[FightResponse])
async def get_all_ufc_fights():
    try:
        fights = await asyncio.to_thread(cached_get_all_ufc_fights)
        return fights 
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"UFC Scraper service failed: {e}") 

@app.post("/UFC/upcoming-fights", summary="Get upcoming fights for the given fighters", response_model=dict[str, FightResponse])
async def get_upcoming_ufc_fights(request: FighterListRequest):
    try:
        # Normalize list to make the cache hit consistent
        fighters_key = tuple(sorted([name.strip().lower() for name in request.fighters]))
        upcoming_fights = await asyncio.to_thread(cached_get_upcoming_ufc_fights, fighters_key)
        return upcoming_fights
    except Exception as e:
        print("Exception was: ", e)
        raise HTTPException(status_code=503, detail=f"UFC Scraper service failed: {e}") 


@app.get("/boxing/fights", summary="Get all upcoming boxing fights", response_model=List[FightResponse])
async def get_all_boxing_fights():
    try:
        fights = await asyncio.to_thread(cached_get_all_boxing_fights)
        return fights 
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Boxing scraper service failed: {e}") 

@app.post("/boxing/upcoming-fights", summary="Get upcoming boxing fights for the given fighters", response_model=dict[str, FightResponse])
async def get_upcoming_boxing_fights(request: FighterListRequest):
    try:
        # Normalize list to make the cache hit consistent
        fighters_key = tuple(sorted([name.strip().lower() for name in request.fighters]))
        upcoming_fights = await asyncio.to_thread(cached_get_upcoming_boxing_fights, fighters_key)
        return upcoming_fights
    except Exception as e:
        logging.error("Exception here: ", e)
        raise HTTPException(status_code=503, detail=f"Boxing scraper service failed: {e}") 