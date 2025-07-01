import logging
import re
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup
from constants import *
from data_models import *

# Logging configuration 
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')



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
            raise Exception(f"Could not load page {url}") from e

    def _parse_event_datetime(self, date_string: str) -> Optional[datetime]:
        """
        Parses a date string like "Sat, Jun 14 / 10:00 PM EDT" into a datetime object.
        Currently does not handle year rollover cases.
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

    def _scrape_upcoming_events(self) -> List[tuple[str, Event]]:
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

                event_url = urljoin(self.base_url, title_tag['href'])
                
                event = Event(
                    date=event_dt,
                    location=location_str
                )
                upcoming_events.append((event_url, event))
            except (AttributeError, KeyError) as e:
                logging.warning(f"Could not fully parse an event card. Error: {e}")
                continue # Move to the next card
                
        logging.info(f"Found {len(upcoming_events)} upcoming events.")
        return upcoming_events

    def _scrape_fights_from_event(self, event_url: str, event: Event) -> List[Fight]:
        """Scrapes all fights from a single event page."""
        logging.info(f"Visiting event url: {event_url}")
        soup = self._get_soup(event_url)
        
        
        fight_list_items = soup.select('.c-listing-fight__content')
        if not fight_list_items:
            logging.warning(f"No fight listings found on page for url: {event_url}")
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
                    fighters=names,
                    event=event
                ))
        return fights

    def get_all_upcoming_fights(self) -> List[Fight]:
        """
        Gets all fights from all upcoming UFC events.
        """
        future_events = self._scrape_upcoming_events()
        all_fights = []
        for event_url, event in future_events:
            try:
                fights_in_event = self._scrape_fights_from_event(event_url, event)
                all_fights.extend(fights_in_event)
            except Exception as e:
                logging.error(f"Could not scrape fights for event '{event_url}': {e}")
                continue # Skip to the next event
        return all_fights

    def filter_fights_for(self, all_fights: List[Fight], target_fighters: List[str]) -> dict[str, Fight]:
        found_fights = {}
        clean_target_map = {
            name.lower().replace(" ", ""): name for name in target_fighters
        }
        for fight in all_fights:
            for fighter_in_fight in fight.fighters:
                clean_fighter = fighter_in_fight.lower().replace(" ", "")
                if clean_fighter in clean_target_map:
                    original_name = clean_target_map[clean_fighter]
                    if original_name not in found_fights:
                        found_fights[original_name] = fight
        return found_fights