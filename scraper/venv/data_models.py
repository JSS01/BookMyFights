from dataclasses import dataclass
from datetime import datetime
from typing import List

'''
Data models used in both the UFC and Boxing scrapers
'''
@dataclass
class Event:
    """ Represents a single event """
    date: datetime
    location: str

@dataclass 
class Fight:
    """ Represents a single fight """
    fighters: List[str]
    event: Event