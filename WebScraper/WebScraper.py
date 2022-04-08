import requests
from bs4 import BeautifulSoup
import re
import csv
import os

def scrape_Transcript(_URL, _season, _episode, _episodeNum):
    transcript_Page = requests.get(_URL)
    new_Soup = BeautifulSoup(transcript_Page.content, "html.parser")
    transcript_Results = new_Soup.find(id="mw-content-text")

    season_Name = _season

    episode_Name = _episode

    
    speakers = transcript_Results.find_all("b")
    for speaker in speakers:
        
        if(speaker.text.find(':') != -1):
            words = speaker.parent.get_text()
            data = [season_Name, episode_Name, _episodeNum, speaker.text, words]
            print(data)
            f = open(os.getcwd() + '/transcript.csv', 'a', newline='', encoding='utf-8')
            writer = csv.writer(f)
            writer.writerow(data)
            f.close()

URL = "https://arthur.fandom.com"
page = requests.get(URL + "/wiki/Transcripts")

soup = BeautifulSoup(page.content, "html.parser")

results = soup.find(id="mw-content-text")

##seasons = results.find_all(class_ = "mw-headline")
##count = 0
##for season in seasons:
##    count += 1
##    episodes = season.findNext('ol').find_all("a")
##    count_E = 0
##    for episode in episodes:
##        count_E += 1
##        #print(count_E)
##        append = episode['href']
##        transcript_URL = URL + append
##        scrape_Transcript(transcript_URL, count, episode.text, count_E)

scrape_Transcript("https://arthur.fandom.com/wiki/D.W.%27s_Library_Card_(episode)/Transcript", 4, "TEST", 1)
    
print("Done")
        

    
