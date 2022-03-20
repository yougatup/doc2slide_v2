import scipdf
import json
import numpy as np
import pandas as pd
import os

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

            print(sectionTitle)

            if sectionTitle == "KEYWORDS" or sectionTitle == "Author Keywords":
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


