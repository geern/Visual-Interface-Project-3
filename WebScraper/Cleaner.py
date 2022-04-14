import csv
import os
import re

count = 1

def clean_left_parenthesis(_text):
    if "(" in _text:
        if ")" in _text:
            _text = _text[0:_text.index("(")] + _text[_text.index(")")+1::]
        else:
            _text = _text[0:_text.index("(")]
    return _text.strip()

def clean_right_parenthesis(_text):
    if ")" in _text:
        if "(" in _text:
            _text = _text[0:_text.index("(")] + _text[_text.index(")")+1::]
        else:
            _text = _text[0:_text.index(")")]
    return _text.strip()

def clean_colon_speaker(_text):
    if ":" in _text:
        _text = _text[0:_text.index(":")]
    return _text.strip()

def clean_colon_line(_text):
    if ":" in _text:
       _text = _text[_text.index(":")+1::]
    return _text.strip()

def delete_colon(_text):
    if ":" in _text:
       _text = _text[0:_text.index(":")] + _text[_text.index(":")+1::]
    return _text.strip()

def clean_Row(_row):
    try:
##        if(count == 14405): print(_row)
        _row[3] = re.sub("[\(\[].*?[\)\]]", "", _row[3])
        _row[4] = re.sub("[\(\[].*?[\)\]]", "", _row[4])
        if ":" in _row[3]:
            _row[3] = clean_colon_speaker(_row[3])
        _row[4] = clean_colon_line(_row[4])
        while ":" in _row[4]:
            _row[4] = delete_colon(_row[4])
##        _row[3] = clean_left_parenthesis(_row[3])
##        _row[4] = clean_colon_line(_row[4])
##        _row[4] = clean_left_parenthesis(_row[4])
##        _row[4] = clean_parenthesis(_row[4])
##        
##        _row[4] = _row[4][_row[4].index(":")+1: len(_row[4])]
##        _row[4] = _row[4].strip()
        return _row
    except:
        print(count)
        print(_row)


f = open(os.getcwd() + '/CleanTranscript.csv', 'w', newline='', encoding='utf-8')
with open('transcript.csv', 'r', encoding='utf-8') as file:
    reader = csv.reader(file, delimiter = ',')
    for row in reader:
        writer = csv.writer(f)
        writer.writerow(row)
        break
    reader = csv.reader(file)
    for row in reader:
        count += 1
        row = clean_Row(row)
        if row[3] != "" and row[4] != "":
            writer = csv.writer(f)
            writer.writerow(row)
f.close()
print("Done")
