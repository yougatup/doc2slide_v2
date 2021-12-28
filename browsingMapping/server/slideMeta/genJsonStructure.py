import json

timestamp = open("slideImages/frameTimestamp.txt", "r")
script = open("slideImages/scriptData.txt", "r")

timestampData = []
scriptData = []

while True :
    line = timestamp.readline()
    if not line :
        break

    timestampData.append([float(line.split('\t')[0]), float(line.split('\t')[1])])

while True :
    line = script.readline()
    if not line :
        break
    
    scriptData.append(line.strip())

result = {}

result['title'] = "tempTitle"
result['slideCnt'] = len(timestampData)
result['slideInfo']= []

for i in range(len(timestampData)) :
    result['slideInfo'].append({
        "index": i,
        "startTime": timestampData[i][0],
        "endTime": timestampData[i][1],
        "script": scriptData[i]
    })

jsonFile = open("slideImages/result.json", "w")
jsonFile.write(json.dumps(result))
