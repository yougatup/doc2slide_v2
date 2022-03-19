import scipdf
import json
import numpy as np
import pandas as pd
import os

flag = 0 # 1 : already created, 0: newly create
datasetFile = "../videoDataset/chi2021/dataset_chi2021.csv"

paperDataPath = "../videoDataset/chi2021/papers_chi2021/"
subtitleDataPath = "../videoDataset/chi2021/subtitles_chi2021/"
videoDataPath = "../videoDataset/chi2021/videos_chi2021/"

processPaperFlag = True
processSubtitleFlag = True
processVideoFlag = False

def getKeyword() :
    import csv

    jsonData = json.load(open('./slideImages/paperData.json'))
    grobidData = json.load(open('./slideImages/grobidResult.json'))

    keywords = []

    for p in jsonData['sections'] :
        sectionTitle = ''
    
        if 'title' in p and 'text' in p['title']:
            sectionTitle = p['title']['text']

            print(sectionTitle)

            if sectionTitle == "KEYWORDS" :
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
        keywordFile = open("./slideImages/keywords.json","w")

        if grobidData != None :
            keywordFile.write(json.dumps(
                {"keywords": keywords,
                "title": grobidData["title"] ,
                "authors": grobidData["authors"] 
                }
            ))

        print(keywords)

    return


def getSectionStructure() :
    jsonData = json.load(open('./slideImages/paperData.json'))
    
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
    
    paper_f = open("./slideImages/paperData.txt", "w")
    
    for b in bodyText:
        paper_f.write(b + "\n")
    
    ###############
    
    paper_s = open("./slideImages/sectionData.txt", "w")

    for b in sectionInfo:
        paper_s.write(b + "\n")

    paper_f.close()
    paper_s.close()


# dataFile = pd.read_csv(datasetFile, encoding_errors='ignore')
dataFile = pd.read_csv(datasetFile)
cnt = 0

valid_presentation_index = []

os.system("rm -rf ./slideData/slideImages")

for index, row in dataFile.iterrows() :
    title = row['title']
    paper = str(row['paper_file'])
    video = row['video_file']
    subtitle = row['subtitle_file']
    videoURL = row['video_url']
    data_imported = row['data_imported']

    if paper == '' or paper == 'nan' or data_imported == 'Y':
        continue

    print(index, title, paper, video, subtitle, videoURL)
    print("cp " + videoDataPath + video + " ./video.mp4")

    if index <= 258 :
        continue

    valid_presentation_index.append(index)

    if flag == 0 :
        os.system("rm -rf ./slideData/" + str(index))

        if processVideoFlag :
            os.system("cp " + videoDataPath + video + " ./video.mp4")

        if processSubtitleFlag :
            os.system("cp " + subtitleDataPath + subtitle + " ./subtitle.srt")
    
        os.system("rm -rf slideImages")
 
        os.system("mkdir slideImages")

        if processPaperFlag :
            print('cp ' + paperDataPath + str(paper) + ' ./slideImages/paper.pdf')
            print('cp '+ paperDataPath + str(paper) + ' ../../../pdffigures2/paper.pdf')

            os.system('cp ' + paperDataPath + str(paper) + ' ./slideImages/paper.pdf')
            os.system('cp '+ paperDataPath + str(paper) + ' ../../../pdffigures2/paper.pdf')

            if not os.path.exists("./slideImages/paperData.json") :
                os.chdir('../../../pdffigures2')
                os.system('pwd')

                os.system('sbt "runMain org.allenai.pdffigures2.FigureExtractorBatchCli paper.pdf -g myPrefix"')

                os.system('cp myPrefixpaper.json ../browsingMapping/server/slideMeta/slideImages/paperData.json')
                os.chdir('../browsingMapping/server/slideMeta')

            if not os.path.exists("./slideImages/grobidResult.json") :
                try :
                    article_dict = scipdf.parse_pdf_to_dict('./slideImages/paper.pdf')  # return dictionary
                except :
                    continue

                paper_grobid = open("./slideImages/grobidResult.json", "w")
                paper_grobid.write(json.dumps(article_dict))
                paper_grobid.close()

            getSectionStructure()
            getKeyword()


        if processVideoFlag: 
    # os.system('cd ../browsingMapping/server')
            os.system("sh genSlides.sh")
    # os.system("sh genOCR.sh")
            os.system("python getSubtitle.py")
        
    #        os.system("cp ../paperParsed/" + str(index+1) + ".txt ./slideImages/paperData.txt")
    #        os.system("cp ../sectionParsed/" + str(index+1) + ".txt ./slideImages/sectionData.txt")
        
    # os.system("python genJsonStructure.py")
    
        
    
        os.system("mv slideImages slideData")
        
        os.system("mv slideData/slideImages ./slideData/" + str(index))


    elif flag == 1 :
        os.system("rm -rf slideImages")

        os.system("cp -rp ./slideData/" + str(index) + " ./slideImages")

        os.system('cp ../papers/' + str(paper) + ' ./slideImages/paper.pdf')

        getSectionStructure()
        getKeyword()

        


# os.system("python genJsonStructure.py")
    
        os.system("rm -rf ./slideData/" + str(index))
        os.system("mv slideImages slideData/" + str(index))
    
#    if index >= 10 :
#        break

_f = open("./slideData/summary.json", "w")

_f.write(json.dumps({
    "presentationCnt": len(valid_presentation_index),
    "valid_presentation_index": valid_presentation_index
}))

_f.close()

os.system("rm -rf ../../public/slideData")
os.system("cp -rp ./slideData ../../public")

