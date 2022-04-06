import requests
import scipdf
import json
from typing import Dict, List
import numpy as np
import pandas as pd
import os

doi = "10.1145/3173574.3174099"
paperTitle = 'Thor’s Hammer: An Ungrounded Force Feedback Device Utilizing Propeller-Induced Propulsive Force'

parsingFlag = 1    # -1: automatic, 1: number, 2: without number

def getSectionStructure() :
    jsonData = json.load(open('./paperData.json'))
    
    bodyText = []
    sectionInfo = []
    
    for p in jsonData['sections'] :
        sectionTitle = ''
    
        if 'title' in p and 'text' in p['title']:
            sectionTitle = p['title']['text']
    
            for j in range(len(p['paragraphs'])) :
        #         __t = nlp(p['paragraphs'][j]['text'])
        #         sentences = list(__t.sents)
        #         
        #         for s in sentences :
        #             bodyText.append(str(s))
                
                bodyText.append(p['paragraphs'][j]['text']) # paragraph-level
                sectionInfo.append(sectionTitle)
    
    paper_f = open("./paperData.txt", "w")
    
    for b in bodyText:
        paper_f.write(b + "\n")
    
    ###############
    
    paper_s = open("./sectionData.txt", "w")

    for b in sectionInfo:
        paper_s.write(b + "\n")

    paper_f.close()
    paper_s.close()

def getKeyword() :
    import csv

    jsonData = json.load(open('./paperData.json'))
    grobidData = json.load(open('./grobidResult.json'))

    keywords = []

    for p in jsonData['sections'] :
        sectionTitle = ''
    
        if 'title' in p and 'text' in p['title']:
            sectionTitle = p['title']['text']

            if sectionTitle == "KEYWORDS" or sectionTitle == "KEYWORDS:" or sectionTitle == "Author Keywords":
                for j in range(len(p['paragraphs'])) :
                    k = p['paragraphs'][j]['text']
                    sniffer = csv.Sniffer()
                    dialect = sniffer.sniff(k)

                    keywords = [ x.strip() for x in k.split(dialect.delimiter) ]

                    break

    if len(keywords) <= 0 :
        for p in jsonData['sections'] :
            if 'paragraphs' in p :
                for p2 in p['paragraphs'] :

                    if p2["text"].startswith("KEYWORDS") :
                        k = p2["text"][9:]
                        sniffer = csv.Sniffer()
                        dialect = sniffer.sniff(k)

                        keywords = [ x.strip() for x in k.split(dialect.delimiter) ]

                        break
            if len(keywords) > 0 :
                break

    print(keywords)

    if len(keywords) <= 0 :
        print("########## TAKE A LOOK ###########")

    else :
        keywordFile = open("./keywords.json","w")

        if grobidData != None :
            keywordFile.write(json.dumps(
                {"keywords": keywords,
                "title": grobidData["title"] ,
                "authors": grobidData["authors"] 
                }
            ))

        print(keywords)

    return

sectionTitleIndex = 0

def isTopSectionTitle(text) :
    global sectionTitleIndex

    parsedIndex = text.split(' ')[0]
            
    if parsedIndex.isdigit() or parsingFlag == 1:
        if parsingFlag == 1 and (not parsedIndex.isdigit()) :
            return (False, {})

        body = text[(len(str(parsedIndex))+1):]
                
        if not (body.isupper()) :
            return (False, {})
        
        return (True, {
            "index": int(parsedIndex),
            "title": body
        })

    else :
        if not (text.isupper()) :
            return (False, {})

        sectionTitleIndex = sectionTitleIndex + 1

        return (True, {
            "index": sectionTitleIndex,
            "title": text 
        })
    
def getSectionTitles (jsonData) :
    sectionTitles = []
    
    for s in jsonData["sections"] :
        if "title" in s :
            titleText = s["title"]["text"]

            print(titleText)

            ret = isTopSectionTitle(titleText)
            
            if ret[0] :
                sectionTitles.append(ret[1])
 
    return sectionTitles

def embed(papers):
    embeddings_by_paper_id: Dict[str, List[float]] = {}

    for chunk in chunks(papers):
        # Allow Python requests to convert the data above to JSON
        response = requests.post(URL, json=chunk)

        if response.status_code != 200:
            raise RuntimeError("Sorry, something went wrong, please try later!")

        for paper in response.json()["preds"]:
            embeddings_by_paper_id[paper["paper_id"]] = paper["embedding"]

    return embeddings_by_paper_id




os.system('cp ./paper.pdf ../../pdffigures2/paper.pdf')

os.chdir('../../pdffigures2')

os.system('sbt "runMain org.allenai.pdffigures2.FigureExtractorBatchCli paper.pdf -g myPrefix"')

os.system('cp myPrefixpaper.json ../slideInterface/sourcePaper/paperData.json')
os.chdir('../slideInterface/sourcePaper')

try :
    article_dict = scipdf.parse_pdf_to_dict('./paper.pdf')  # return dictionary
except :
    a = 1
else :
    paper_grobid = open("./grobidResult.json", "w")
    paper_grobid.write(json.dumps(article_dict))
    paper_grobid.close()
        
    getSectionStructure()
    getKeyword()


jsonData = json.load(open("./paperData.json"))
titles = getSectionTitles(jsonData)
sectionCnt = len(titles)
    
flag = False
    
for i in range(1, sectionCnt+1) :
    if titles[i-1]["index"] != i :
        flag = True
        break
    
sectionDatabase = []

print(titles)

if flag :
    print("**** needs attention **** ")
    print(titles)
    
    cnt = cnt + 1
    
else :
    db = {}
    curSection = ''
    cnt = 1
    
    for s in jsonData["sections"] :
        if not "paragraphs" in s :
            continue
            
        if "title" in s and isTopSectionTitle(s["title"]["text"])[0] :
            curSection = s["title"]["text"]
            
        if curSection != '' :
            for p in s["paragraphs"] :
                text = p["text"]
            
                if not curSection in db :
                    db[curSection] = ''
                    
                tmp = db[curSection] + ('' if len(db[curSection]) == 0 else ' ') + text
                
                if len(tmp.split(' ')) <= 300 :
                    db[curSection] = tmp
 
    sectionDatabase.append({
            "index": 0,
            "paperTitle": paperTitle,
            "body": db
    })

    URL = "https://model-apis.semanticscholar.org/specter/v1/invoke"
    MAX_BATCH_SIZE = 16
    
    def chunks(lst, chunk_size=MAX_BATCH_SIZE):
        """Splits a longer list to respect batch size"""
        for i in range(0, len(lst), chunk_size):
            yield lst[i : i + chunk_size]
    
    SAMPLE_PAPERS = []
    
    for i in range(len(sectionDatabase)) :
        paperTitle = sectionDatabase[i]["paperTitle"]
        
        for k in sectionDatabase[i]["body"] :
            SAMPLE_PAPERS.append({
                "paper_id": str(i) + "_" + k,
                "title": paperTitle,
                "abstract": sectionDatabase[i]["body"][k]
            })
        
    def embed(papers):
        embeddings_by_paper_id: Dict[str, List[float]] = {}
    
        for chunk in chunks(papers):
            # Allow Python requests to convert the data above to JSON
            response = requests.post(URL, json=chunk)
    
            if response.status_code != 200:
                raise RuntimeError("Sorry, something went wrong, please try later!")
    
            for paper in response.json()["preds"]:
                embeddings_by_paper_id[paper["paper_id"]] = paper["embedding"]
    
        return embeddings_by_paper_id
        
    all_embeddings = embed(SAMPLE_PAPERS)

    f = open("sectionEmbeddingDB.json", "w")
    f.write(json.dumps(all_embeddings))
