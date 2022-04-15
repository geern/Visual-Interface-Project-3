#Scraping specifically season 4 episode 1
import requests
from bs4 import BeautifulSoup
import csv
import os

def LCScraper():
    html_doc = requests.get("https://arthur.fandom.com/wiki/D.W.%27s_Library_Card_(episode)/Transcript")
    if html_doc:
        print("gay porn real")

        soup = BeautifulSoup(html_doc.content, "html.parser")

        #print(soup.prettify())

        #get sript, includes names n stuff
        season_name = 4
        episode_name = "D.W.'s Library Card"
        episode_num = 1

        text = []
        speaker = []
        fields = ["Season","Episode Name","Episode Number","Speaker","Text"]
        data = []
        for p in soup.findAll('p'):
            for line in p.getText().splitlines(): #for each line
                colon_index = line.find(":") #grab index of first colon
                if(colon_index > -1 and line.find("(") != 0): #( check for specific edge case
                    #speaker += [line[0:colon_index]] #save up until first colon
                    #text += [line[colon_index+1::]]
                    data += [[season_name, episode_name, episode_num, line[0:colon_index], line[colon_index+1::]]]
        

        #write to csv
        f = open(os.getcwd() + './WebScraper/s4e1_transcript.csv', 'a', newline='', encoding='utf-8')
        writer = csv.writer(f)
        writer.writerow(fields)
        writer.writerows(data)
        f.close()
    else:
        print("Grabbing website failed.")
    


if(__name__ == "__main__"):
    LCScraper()