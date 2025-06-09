import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime
import re

def is_event_in_future(event_string):
    """
    Checks if an event date and time from a string like
    "Sat, Jun 14 / 10:00 PM EDT / Main Card" is in the future.
    """
    # Define a regex pattern to extract the relevant parts
    # (DayOfWeek, Month Abbr Day / Time AM/PM)
    pattern = r"^\w+, (\w{3}) (\d{1,2}) / (\d{1,2}):(\d{2}) (AM|PM)"

    match = re.match(pattern, event_string)

    if not match:
        print(f"Error: Could not parse event string format for '{event_string}'.")
        return False

    month_abbr, day_of_month, hour_str, minute_str, ampm = match.groups()

    # Get the current year to construct the full date.
    # This is important because the input string doesn't include the year.
    current_year = datetime.now().year

    date_time_str_for_parsing = f"{month_abbr} {day_of_month} {current_year} {hour_str}:{minute_str} {ampm}"

    try:
        # Parse the extracted date and time
        event_datetime = datetime.strptime(date_time_str_for_parsing, "%b %d %Y %I:%M %p")

        # Handle year rollover: If the parsed month is earlier than the current month
        # and the current month is late in the year (e.g., December and parsed is January),
        # assume it's next year.
        if event_datetime.month < datetime.now().month and datetime.now().month == 12:
            event_datetime = event_datetime.replace(year=current_year + 1)

        # Get the current datetime
        now = datetime.now()

        # Compare the event datetime with the current datetime
        return event_datetime > now

    except ValueError as e:
        print(f"Error parsing date/time from '{event_string}': {e}")
        return False
    

def filter_future_fights(event_links, event_date_tags):
        # List to store information about future events
        future_events_info = []

        # Ensure both lists have the same length
        if len(event_links) != len(event_date_tags):
            print("Issue: # of event links != # of event dates")
        else:
            for i in range(len(event_links)):
                event_link_tag = event_links[i]
                event_date_tag = event_date_tags[i]

                # Extract the text from the date tag
                event_date_string = event_date_tag.get_text(strip=True)

                # Check if the event is in the future
                if is_event_in_future(event_date_string):
                    event_title = event_link_tag.get_text(strip=True)
                    event_href = event_link_tag.get('href')

                    future_events_info.append({
                        "title": event_title,
                        "href": event_href,
                        "date_string": event_date_string
                    })

        return future_events_info


def get_upcoming_fights(fighter_names):
    """
    Scrapes the official UFC website for upcoming fights for a given list of fighters,
    including main and undercard fights, using requests and BeautifulSoup.
    """
    # Base URL for the UFC website
    base_url = "https://www.ufc.com"
    events_url = urljoin(base_url, "/events")
    
    # Set headers to mimic a real browser visit
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    fight_card = {}
    
    try:
        # --- Step 1: Get all event page URLs from the main events page ---
        response = requests.get(events_url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Get all links that lead to undercards
        event_links = soup.select('.c-card-event--result__headline > a')
        # Get each events date (verify it's in the future)
        event_date_tags = soup.select(".c-card-event--result__date > a")

        # List to store information about future events
        future_events_info = filter_future_fights(event_links, event_date_tags)

        # --- Step 2: Visit each event page and parse the full fight card ---
        for event_data in future_events_info:
            url = urljoin(base_url, event_data['href'])
            event_date_at_main_page = event_data['date_string'] 
            event_title_at_main_page = event_data['title']

            print(f"Visiting event page: {url}")
            event_response = requests.get(url, headers=headers)
            event_response.raise_for_status()
            event_soup = BeautifulSoup(event_response.text, 'html.parser')
            
            event_title_on_page = event_soup.find('h1').get_text(strip=True) if event_soup.find('h1') else event_title_at_main_page
            
            fight_list_items = event_soup.select('.c-listing-fight__content')

            for item in fight_list_items:
                # Extract all fighter names from the bout
                names = [name.get_text(separator=' ', strip=True) for name in item.select('.c-listing-fight__corner-name')]
                
                # Check if any of our target fighters are in this bout
                for target_fighter in fighter_names:
                    clean_target_fighter = target_fighter.lower().replace(" ", "")

                    for name in names:
                        clean_name = name.lower().replace(" ", "") # Clean scraped name
                        if clean_target_fighter in clean_name:
                            # Find the opponent
                            opponent_name = "TBD"
                            for n in names:
                                # Ensure it's not the same fighter (case-insensitive and space-insensitive)
                                if n.lower().replace(" ", "") != clean_name:
                                    opponent_name = n
                                    break
                            
                            fight_card[target_fighter] = {
                                'event': event_title_on_page,
                                'opponent': opponent_name,
                                'date': event_date_at_main_page # Add the event date here!
                            }
                            # Once found for this target_fighter, no need to check other names in this bout
                            break 
                            
    except requests.exceptions.RequestException as e:
        print(f"An HTTP request error occurred: {e}")
        return {}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {}
    return fight_card


def main():
    # Example list of fighters to search for
    fighters_to_find = ["Kamaru Usman", "Joaquin Buckley", "Ilia Topuria", "Mansur Abdul-Malik", "Tatsuro Taira", "Amir Albazi", "Dustin Poirier"]
    upcoming_fights = get_upcoming_fights(fighters_to_find)

    if upcoming_fights:
        print("\nUpcoming Fights Found:")
        for fighter, details in upcoming_fights.items():
            print(f"  - {fighter}:")
            print(f"    Event: {details['event']}")
            print(f"    Opponent: {details['opponent']}")
            print(f"    Date: {details['date']}") # Print the date
            print("-" * 30)
    else:
        print("No upcoming fights found for the specified fighters.")


main()