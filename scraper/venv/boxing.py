from dataclasses import dataclass
from datetime import date, datetime, time
import re
from bs4 import BeautifulSoup
import requests
from constants import *
from typing import List
import logging

# Logging configuration 
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


@dataclass 
class Event:
    date: datetime
    location: str

@dataclass
class Fight:
    fighters: List[str]
    event: Event

class BoxingScraper:
    '''
    Scrapes the ESPN website for upcoming boxing fights
    '''
    def __init__(self, base_url):
        self.base_url = base_url
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

    def _parse_fight_string(self, fight_str: str) -> tuple[str, str] | None:
        '''
        Uses a regular expression to parse the extracted fight details for the 
        two fighters names. 
        '''
        pattern = r"(?:Title fight:\s*)?(.+?)\s+vs\.\s+(.+?)(?:,|$)"
        match = re.search(pattern, fight_str)
        if match:
            fighter_1 = match.group(1).strip()
            fighter_2 = match.group(2).strip()
            return fighter_1, fighter_2 
        return None 

    def _parse_event_headline(self, event_str: str) -> Event | None:
        '''
        Uses a regular expression to parse the event headline for 
        details like the date and location. 
        '''
        pattern = r"(.+?)\.?\s+(\d{1,2}):(.+?)\(?"
        match = re.search(pattern, event_str)
        if match:
            month = match.group(1).strip()
            if month == "Sept": month = "Sep"
            day = int(match.group(2).strip())
            event_location = match.group(3).strip()

            # Use the current year 
            year = datetime.now().year

            # Convert month string to month number using locale abbreviation
            try:
                month = datetime.strptime(month, "%b").month 
            except ValueError:
                try:
                    month = datetime.strptime(month, "%B").month 
                except ValueError:
                    raise ValueError(f"Unknown month format: {month}")
                
            # Set default start time as 10pm 
            ten_pm = time(hour=22)
            event_date = datetime.combine(datetime(year, month, day).date(), ten_pm)
            return Event(date=event_date, location=event_location)

        logging.warning(f"Could not parse event string: {event_str}")
        return None
        

    def get_all_upcoming_fights(self) -> List[Fight]:
        soup = self._get_soup(self.base_url)
        event_headlines = soup.find_all(name='h3')

        all_fights = []

        for event_headline in event_headlines:
            event_title = event_headline.get_text(strip=True)
            fight_list_ul = event_headline.find_next_sibling('ul')
            event = self._parse_event_headline(event_title)
            if fight_list_ul:
                for fight_li in fight_list_ul.find_all('li'):
                    fight_details = fight_li.get_text(separator=" ", strip=True)
                    fighters = self._parse_fight_string(fight_details)
                    if fighters:
                        all_fights.append(Fight(fighters=fighters, event=event))
            else:
                logging.warning(f"No <ul> found for headline {event_headline}")
        return all_fights
        
        
    def get_upcoming_fights_for(self, fighters: List[str]) -> List[Fight]:
        all_fights = self.get_all_upcoming_fights()
        found_fights = {}
        
        # Normalize input to lower case for case-insensitive comparison
        target_fighters = set(f.lower() for f in fighters)

        matching_fights = [
            fight for fight in all_fights
            if any(fighter.lower() in target_fighters for fighter in fight.fighters)
        ]

        return matching_fights


def main():
    scraper = BoxingScraper(BASE_BOXING_URL)
    for fight in scraper.get_upcoming_fights_for([]):
        print(fight, "\n")

if __name__ == "__main__":
    main()
