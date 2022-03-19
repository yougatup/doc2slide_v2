from googlesearch import search
import os
from pytube import Playlist, YouTube
import pandas as pd

df = pd.read_csv("__data_with_paper_link.csv")

print(df)

cnt = 0

for index, row in df.iterrows() :
    paperTitle = row['title']

    query = paperTitle + "dl acm"

    print(index)
    print(row['title'])

    if str(row['paper_link']) == "nan" :
        for j in search(query, num=10, stop=10, pause=2):
            if ("dl.acm.org" in j) : 
                df.loc[index, 'paper_link'] = j
                break

    df.to_csv("____data_with_paper_link.csv")
