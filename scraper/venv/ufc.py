import logging
import re
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup
from constants import *

# Logging configuration 
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Custom Exceptions for Error Handling
class UFCScraperException(Exception):
    """Base exception for the scraper."""
    pass

class PageLoadError(UFCScraperException):
    """Raised when a web page fails to load."""
    pass

class ParsingError(UFCScraperException):
    """Raised when HTML parsing fails to find expected elements."""
    pass

# Data Models 
@dataclass
class Event:
    """Represents a single UFC event."""
    title: str
    url: str
    date_time: datetime
    venue: str
    location: str

@dataclass
class Fight:
    """Represents a single fight within an event."""
    event_title: str
    fighters: List[str]
    date_time: datetime
    venue: str
    location: str

# --- Main Scraper Class ---
class UFCScraper:
    """
    Scrapes the official UFC website for upcoming events and fights.
    """
    def __init__(self, base_url: str = BASE_UFC_URL):
        self.base_url = base_url
        self.events_url = urljoin(self.base_url, UFC_EVENTS_PATH)
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': DEFAULT_USER_AGENT})

    def _get_soup(self, url: str) -> BeautifulSoup:
        """Fetches a URL and returns a BeautifulSoup object."""
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to load page: {url}. Error: {e}")
            raise PageLoadError(f"Could not load page {url}") from e

    def _parse_event_datetime(self, date_string: str) -> Optional[datetime]:
        """
        Parses a date string like "Sat, Jun 14 / 10:00 PM EDT" into a datetime object.
        Handles the year-rollover edge case.
        """
        pattern = r"^\w+, (\w{3}) (\d{1,2}) / (\d{1,2}):(\d{2}) (AM|PM)"
        match = re.match(pattern, date_string)

        if not match:
            logging.warning(f"Could not parse event date format: '{date_string}'")
            return None

        month_abbr, day, hour, minute, ampm = match.groups()
        now = datetime.now()
        
        # Assume current year initially
        date_time_str = f"{month_abbr} {day} {now.year} {hour}:{minute} {ampm}"
        
        try:
            event_dt = datetime.strptime(date_time_str, "%b %d %Y %I:%M %p")
            return event_dt
        except ValueError as e:
            logging.error(f"Error parsing date/time from '{date_string}': {e}")
            return None

    def _scrape_upcoming_events(self) -> List[Event]:
        """Scrapes the main events page for future events."""
        logging.info(f"Fetching events from {self.events_url}")
        soup = self._get_soup(self.events_url)
        event_cards = soup.select('.c-card-event--result')
        
        upcoming_events = []
        now = datetime.now()

        for card in event_cards:
            try:
                date_tag = card.select_one(".c-card-event--result__date a")
                if not date_tag:
                    continue # Skip if date is missing
                
                event_dt = self._parse_event_datetime(date_tag.get_text(strip=True))
                if not event_dt or event_dt <= now:
                    continue # Skip past events or unparseable dates

                title_tag = card.select_one('.c-card-event--result__headline > a')
                venue_tag = card.select_one(".field--name-taxonomy-term-title > h5")
                
                # Location data
                locality = card.select_one(".locality")
                area = card.select_one(".administrative-area")
                country = card.select_one(".country")
                location_parts = [
                    part.get_text(strip=True) for part in [locality, area, country] if part
                ]
                location_str = ", ".join(location_parts)

                if not (title_tag and venue_tag):
                    logging.warning("Skipping card, missing title or venue.")
                    continue

                event = Event(
                    title=title_tag.get_text(strip=True),
                    url=urljoin(self.base_url, title_tag['href']),
                    date_time=event_dt,
                    venue=venue_tag.get_text(strip=True),
                    location=location_str
                )
                upcoming_events.append(event)
            except (AttributeError, KeyError) as e:
                logging.warning(f"Could not fully parse an event card. Error: {e}")
                continue # Move to the next card
                
        logging.info(f"Found {len(upcoming_events)} upcoming events.")
        return upcoming_events

    def _scrape_fights_from_event(self, event: Event) -> List[Fight]:
        """Scrapes all fights from a single event page."""
        logging.info(f"Visiting event page: {event.title}")
        soup = self._get_soup(event.url)
        
        # Use the event page's title for more accuracy (e.g., includes ': Holloway vs Gaethje')
        page_title = soup.find('h1').get_text(strip=True) if soup.find('h1') else event.title
        
        fight_list_items = soup.select('.c-listing-fight__content')
        if not fight_list_items:
            logging.warning(f"No fight listings found on page for {event.title}")
            return []

        fights = []
        for item in fight_list_items:
            name_tags = item.select('.c-listing-fight__corner-name a')
            # Fallback for names not in an 'a' tag
            if not name_tags:
                name_tags = item.select('.c-listing-fight__corner-name')
            
            names = [name.get_text(separator=' ', strip=True) for name in name_tags]
            if len(names) == 2:
                fights.append(Fight(
                    event_title=page_title,
                    fighters=names,
                    date_time=event.date_time,
                    venue=event.venue,
                    location=event.location
                ))
        return fights

    def get_all_upcoming_fights(self) -> List[Fight]:
        """
        Gets all fights from all upcoming UFC events.
        """
        future_events = self._scrape_upcoming_events()
        all_fights = []
        for event in future_events:
            try:
                fights_in_event = self._scrape_fights_from_event(event)
                all_fights.extend(fights_in_event)
            except (PageLoadError, ParsingError) as e:
                logging.error(f"Could not scrape fights for event '{event.title}': {e}")
                continue # Skip to the next event
        return all_fights

    def get_upcoming_fights_for(self, target_fighters: List[str]) -> dict[str, Fight]:
        """
        Finds the next scheduled fight for a given list of fighters.

        Args:
            target_fighters: A list of fighter names to search for.

        Returns:
            A dictionary where keys are the found fighter names and
            values are the corresponding Fight objects.
        """
        all_fights = self.get_all_upcoming_fights()
        found_fights = {}
        
        # Normalize target names for efficient lookup
        clean_target_map = {
            name.lower().replace(" ", ""): name for name in target_fighters
        }
        
        for fight in all_fights:
            for fighter_in_fight in fight.fighters:
                clean_fighter = fighter_in_fight.lower().replace(" ", "")
                if clean_fighter in clean_target_map:
                    original_name = clean_target_map[clean_fighter]
                    # Add only if we haven't found a fight for this target yet
                    if original_name not in found_fights:
                        found_fights[original_name] = fight
        
        return found_fights

def main():
    fighters_to_find = [
        "Josh Emmett", "Jamahal Hill", "Kamaru Usman", "Joaquin Buckley", "Ilia Topuria", 
        "Mansur Abdul-Malik", "Dustin Poirier", "Conor McGregor"
    ]
    
    scraper = UFCScraper()
    
    try:
        upcoming_fights = scraper.get_upcoming_fights_for(fighters_to_find)
        if upcoming_fights:
            print("\n--- Upcoming Fights Found ---")
            for fighter, details in upcoming_fights.items():
                print(f"  🥊 Fighter: {fighter}")
                print(f"    Event:    {details.event_title}")
                print(f"    Matchup:  {' vs '.join(details.fighters)}")
                print(f"    Date:     {details.date_time.strftime('%a, %b %d, %Y at %I:%M %p')}")
                print(f"    Venue:    {details.venue}")
                print(f"    Location: {details.location}")
                print("-" * 30)
        else:
            print("\nNo upcoming fights found for the specified fighters.")
            
    except UFCScraperException as e:
        print(f"\nAn error occurred during scraping: {e}")

if __name__ == "__main__":
    main()