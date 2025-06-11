from typing import List
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime
import re

# Constants 
BASE_UFC_URL = "https://www.ufc.com"
EVENTS_URL = urljoin(BASE_UFC_URL, "/events")
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def is_event_in_future(event_string: str) -> bool:
    """
    Checks if an event date and time from a string like
    "Sat, Jun 14 / 10:00 PM EDT / Main Card" is in the future.
    """
    # Define a regex pattern to extract the relevant parts
    # (Day Of Week, Month Day / Time AM/PM)
    pattern = r"^\w+, (\w{3}) (\d{1,2}) / (\d{1,2}):(\d{2}) (AM|PM)"
    match = re.match(pattern, event_string)

    if not match:
        print(f"Error: Could not parse event string format for '{event_string}'.")
        return False

    month_abbr, day_of_month, hour_str, minute_str, ampm = match.groups()

    # Get the current year to construct the full date.
    current_year = datetime.now().year
    date_time_str_for_parsing = f"{month_abbr} {day_of_month} {current_year} {hour_str}:{minute_str} {ampm}"

    try:
        # Get datetime of the event
        event_datetime = datetime.strptime(date_time_str_for_parsing, "%b %d %Y %I:%M %p")
        # Get the current datetime
        now = datetime.now()
        # Compare the event datetime with the current datetime
        return event_datetime > now

    except ValueError as e:
        print(f"Error parsing date/time from '{event_string}': {e}")
        return False
    
def create_soup(url) -> BeautifulSoup:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status() 
        soup = BeautifulSoup(response.text, 'html.parser')
        return soup 

def _get_event_locations(soup: BeautifulSoup) -> List[dict]:
    event_location_groups = soup.select("p.address")
    event_locations = []
    for group in event_location_groups:
        locality_span = group.select_one(".locality")
        area_span = group.select_one(".administrative-area")
        country_span = group.select_one(".country")

        locality = locality_span.get_text(strip=True) if locality_span else None
        area = area_span.get_text(strip=True) if area_span else None
        country = country_span.get_text(strip=True) if country_span else None

        location_dict = {
            "locality" : locality,
            "area" : area,
            "country" : country
        }
        event_locations.append(location_dict)
    
    return event_locations    

def get_all_events() -> List[dict]:
        events = []
        # Get soup for the events page
        soup = create_soup(EVENTS_URL)
        # Get each events undercard link
        event_links = soup.select('.c-card-event--result__headline > a')
        # Get each events date 
        event_date_tags = soup.select(".c-card-event--result__date > a")
        # Get each events venue
        event_venue_tags = soup.select(".field--name-taxonomy-term-title > h5")
        # Get each events location
        event_locations = _get_event_locations(soup)

        # Ensure both lists have the same length
        if len(event_links) != len(event_date_tags):
            print("Issue: # of event links != # of event dates")
        else:
            for i in range(len(event_links)):
                event_link_tag = event_links[i]
                event_date_tag = event_date_tags[i]
                event_venue_tag = event_venue_tags[i]
                event_location = event_locations[i]
                location_str = ", ".join([val for val in event_location.values() if val])
                event_date_str = event_date_tag.get_text(strip=True)

                # Add event if it's in the future
                if is_event_in_future(event_date_str):
                    events.append({
                        "title":  event_link_tag.get_text(strip=True),
                        "href": event_link_tag.get('href'),
                        "date_string": event_date_str,
                        "venue": event_venue_tag.get_text(strip=True),
                        "location": location_str
                    })
        return events


def get_all_fights():
    """
    Scrapes the official UFC website for all upcoming fights.
    """

    fights = []
    try:
        # --- Step 1: Get all events from the main events page ---
        future_events = get_all_events()

        # --- Step 2: Visit each event page to get fights ---
        for event in future_events:
            url = urljoin(BASE_UFC_URL, event['href'])
            event_date = event['date_string'] 
            event_title = event['title']
            event_venue = event['venue']
            event_location = event['location']

            # Visit the event url 
            print(f"Visiting event page: {url}")
            # event_response = requests.get(url, headers=HEADERS)
            # event_response.raise_for_status()
            # event_soup = BeautifulSoup(event_response.text, 'html.parser')
            event_soup = create_soup(url)
            
            event_title_on_page = event_soup.find('h1').get_text(strip=True) if event_soup.find('h1') else event_title
            fight_list_items = event_soup.select('.c-listing-fight__content')

            # For each fight, check if it involves one of our fighters
            for item in fight_list_items:
                # Get the two fighters in the fight
                name_tags = item.select('.c-listing-fight__corner-name')
                names = [name.get_text(separator=' ', strip=True) for name in name_tags]
                # Check if any of our target fighters are in this fight
                fight = {
                        'event': event_title_on_page,
                        'fighters': names,
                        'date': event_date, 
                        'venue': event_venue,
                        'location' : event_location
                    }
                fights.append(fight)
                            
    except requests.exceptions.RequestException as e:
        print(f"An HTTP request error occurred: {e}")
        return {}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {}
    return fights


def get_upcoming_fights(fighter_names):
    """
    Searches through all upcoming fights and returns those 
    involving one of the given fighters.
    """

    all_fights = get_all_fights()
    found_fights = {}
    for fight in all_fights:
        cleaned_combatants = [f.lower().replace(" ", "") for f in fight['fighters']]
        for target_fighter in fighter_names:
            clean_target_fighter = target_fighter.lower().replace(" ", "")
            if clean_target_fighter in cleaned_combatants:
                found_fights[target_fighter] = fight
    
    return found_fights


def main():
    # Example list of fighters to search for
    fighters = ["Jamahal Hill", "Kamaru Usman", "Joaquin Buckley", "Ilia Topuria", "Mansur Abdul-Malik", "Dustin Poirier"]
    upcoming_fights = get_upcoming_fights(fighters)

    if upcoming_fights:
        print("\nUpcoming Fights Found:")
        for fighter, details in upcoming_fights.items():
            print(f"  - {fighter}:")
            print(f"    Event: {details['event']}")
            print(f"    Fighters: {details['fighters']}")
            print(f"    Date: {details['date']}") 
            print(f"    Venue: {details['venue']}") 
            print(f"    Location: {details['location']}") 
            print("-" * 30)
    else:
        print("No upcoming fights found for the specified fighters.")

main()