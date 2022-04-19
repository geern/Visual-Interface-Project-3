# Get frequency of characters talking to each other
# char1, char2, freq (num)
# Kevin Eaton

import csv
import json
from operator import itemgetter
from bleach import clean
import pandas as pd


def CleanTranscript(season="all"):
    #get CleanTranscript.csv, take out unnecessary columns
    
    cleaned_transcript = pd.read_csv('CleanTranscript.csv')
    
    #drop name and text
    cleaned_transcript.drop('Episode Name', inplace=True, axis=1)
    cleaned_transcript.drop('Text', inplace=True, axis=1)

    cleaned_transcript = cleaned_transcript.values.tolist()
    #if all, get all seasons, otherwise return specific
    if(season == "all"):
        return(cleaned_transcript)
    else:
        season_transcript = []
        for row in cleaned_transcript:
            if(row[0] == int(season)):
                season_transcript.append(row)
        return(season_transcript)

def FindFreq(cleaned_transcript, file_out_name):
    freq_table = []
    already_added = []
    #[[char1, char2, freq], [char1, char3, freq]]

    prev_ep = 1
    i = -1
    for index in range(len(cleaned_transcript) - 1):
        row = cleaned_transcript[index]
        #Lazy method for now
        #if finished, exit
        if(index > len(cleaned_transcript)-1):
            return freq_table
        
        #get curr episode (no season, change is iterative)
        ep = row[1]
        if(prev_ep == ep): #no episode change
            #speakers currently looking at
            speaker1 = cleaned_transcript[index][2]
            speaker2 = cleaned_transcript[index+1][2]

            #check if D.W. is actually D.W and fix
            if(speaker1 == "D.W"):
                speaker1 = "D.W."
            elif(speaker2 == "D.W"): 
                speaker2 = "D.W."

            #check if it exists already
            do_append = True
            for i in range(len(already_added)):
                if ([speaker1, speaker2] == already_added[i] or [speaker2, speaker1] == already_added[i]):
                    do_append = False
                    break
            
            if(do_append):
                #not already added
                already_added.append([speaker1, speaker2])
                
                #add to freq table
                freq_table.append([speaker1, speaker2, 1])
                
            else:
                #already in table, update freq
                freq_table[i][2] += 1
        prev_ep = ep
    freq_table = sorted(freq_table, key=itemgetter(2), reverse=True)
    clean_table = CleanFreqTable(freq_table)

    #write to json
    with open("./Processing/Data/" + file_out_name + ".json", "w") as f:
        json.dump(clean_table, f)
    
def CleanFreqTable(freq_table):
    #remove 
    # same names (delete)
    # misspelled namess (D.W., D.W)
    # characters no one cares about 


    characters = []
    #clear out characters no one cares about
    with open("./characters.json", "r") as f:
        char_json = json.load(f)
        for char in char_json:
            characters.append(char["name"])
    
    
    #post processing clean
    i = 0
    while i < len(freq_table):
        #D.W. format edge case
        if(freq_table[i][0] == "D.W"):
            freq_table[i][0] = "D.W."
        elif(freq_table[i][1] == "D.W"): 
            freq_table[i][1] = "D.W."

        #Same name after each other
        if(freq_table[i][0] == freq_table[i][1]):
            del freq_table[i]
        #not in top characters from json file
        elif(freq_table[i][0] not in characters or freq_table[i][1] not in characters):
            del freq_table[i]
        else:
            i += 1
    return freq_table


    
def main():
    transcript = CleanTranscript()
    FindFreq(transcript, "frequency")
    
    print("finished big boy")
    i = 1
    while i < 27:
        if(i != 25):
            transcript = CleanTranscript(i)
            FindFreq(transcript, "frequency" + str(i))
            print("Finished with season " + str(i))

        i += 1

if(__name__ == "__main__"):
    main()