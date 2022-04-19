# A way to process the cleaned transcript
# currently, putting data into character.json and episodes.json
# see ex json files to see format
# Kevin Eaton

import csv, json
from operator import itemgetter
from tabnanny import check
import time

def CharacterStrip():
    #Read data from the CSV Transcript
    # help from https://realpython.com/python-csv/ 
    dump = []

    with open('./CleanTranscript.csv', 'r', encoding='utf-8') as csv_file:
        csv_reader = csv.reader(csv_file)
        line_count = 0

        for row in csv_reader:
            if line_count == 0:
                line_count += 1
            else:
                #check if DW error
                if(row[3] == "D.W"):
                    row[3] = "D.W."
                #check dump to make sure character is not used yet
                check_flag = False
                for i in range(len(dump)):
                    #if in dump
                    if(dump[i]["name"]) == row[3]:
                        #update check flag and entry
                        check_flag = True
                        dump[i] = updateDump(dump[i], row)

                #if not already an entry in dump
                if not check_flag:
                    #if not in dump, make new entry
                    dump.append(
                        {
                            "name": row[3],
                            "total_episodes": 1,
                            "total_lines": 1,
                            "season_and_episode": [
                                [int(row[0]), int(row[2])]
                            ]
                        }
                    )
                line_count += 1
    print(f'Processed {line_count} lines.')
    #sort by total episodes, desc
    dump = sorted(dump, key=lambda d: d['total_episodes'], reverse=True) 
    #clean and get only top 15
    dump = characterClean(dump)
    dump = dump[0:15]
    for item in dump:
        print(item["name"] + " : " + str(item["total_episodes"]))
    #write to json file
    with open("./characters.json", "w") as f:
        json.dump(dump, f)

def updateDump(to_update, row):
    #to update is a dict
    to_update["total_lines"] += 1

    #check if this season and episode are already there
    curr_season_and_episode = [int(row[0]), int(row[2])]

    #if the season and episode are in there, return what we have so far
    #otherwise, add it
    for se in to_update["season_and_episode"]:
        if(se == curr_season_and_episode):
            return to_update
    
    #new episode, update
    to_update["season_and_episode"].append([int(row[0]), int(row[2])])
    to_update["total_episodes"] += 1

    return to_update

def EpisodesStrip():
    #Read data from the CSV Transcript
    # help from https://realpython.com/python-csv/ 
    dump = []

    with open('./CleanTranscript.csv', 'r', encoding='utf-8') as csv_file:
        csv_reader = csv.reader(csv_file)
        line_count = 0

        for row in csv_reader:
            if line_count == 0:
                line_count += 1
            else:
                #check dump to make sure character is not used yet
                check_flag = False
                for i in range(len(dump)):
                    #if in dump
                    if(dump[i]["season"] == row[0] and dump[i]["episode"] == row[2]):
                        #update check flag and entry
                        check_flag = True
                        #check if character is there yet
                        dump[i]["characters"] = updateEpisode(dump[i]["characters"], row)
                        
                        
                
                #if not already an entry in dump (next)
                if not check_flag:
                    #lines is a count of lines, starts at 1 obv ¯\_(ツ)_/¯
                    dump.append(
                        {
                            "season": row[0],
                            "episode": row[2],
                            "characters": [
                                {
                                    "name": row[3],
                                    "lines": 1
                                }
                            ]
                        }
                    )
                line_count += 1
    print(f'Processed {line_count} lines.')
    #print(dump)
    #write to json file
    with open("./episodes.json", "w") as f:
        json.dump(dump, f)

def updateEpisode(characters, row):
    for j in range(len(characters)):
        if characters[j]["name"] == row[3]:
            characters[j]["lines"] += 1
            return characters
        
    characters.append({
        "name": row[3],
        "lines": 1
    })
    
    return characters

def characterClean(dump):
    #post processing clean
    i = 0
    while i < len(dump):
        if(dump[i]["name"].__contains__("+") or dump[i]["name"] == "Title Card" or dump[i]["name"] == "Kids" or dump[i]["name"] == "Announcer"):
            del dump[i]
        else:
            i += 1
    
    return dump


def main():
    CharacterStrip()


if(__name__ == "__main__"):
    main()

