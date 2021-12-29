import pandas as pd
import os

# os.system("rm -rf slideData")
# os.system("mkdir slideData")

dataFile = pd.read_csv("../data.csv")
cnt = 0

for index, row in dataFile.iterrows() :
    if index <= 3 :
        continue

    title = row['title']
    paper = row['paper_file']
    video = row['video_file']
    subtitle = row['subtitle_file']
    videoURL = row['video_url']

    print(index, title, paper, video, subtitle, videoURL)
    print('')

    os.system("cp ../" + video + " ./video.mp4")
    os.system("cp ../" + subtitle + " ./subtitle.srt")

    os.system("rm -rf slideImages")

    os.system("sh genSlides.sh")
    os.system("sh genOCR.sh")
    os.system("python getSubtitle.py")
    os.system("python genJsonStructure.py")

    os.system("mv slideImages slideData")

    os.system("mv slideData/slideImages ./slideData/" + str(index))

    cnt = cnt + 1

cmd = 'echo \'{"presentationCnt": ' + str(cnt) + '}\' > slideData/summary.json'
os.system(cmd)
