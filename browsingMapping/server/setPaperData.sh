#!/bin/bash
index=0
INPUT=data.csv
OLDIFS=$IFS
IFS=','

[ ! -f $INPUT ] && { echo "$INPUT file not found"; exit 99; }

while IFS=',' read title paperfile videofile subtitleFile
do
	echo "Name : $title"
	echo "paper: $paperfile"
	echo "video: $videofile"
	echo "subtitle: $subtitleFile"

	subtitleFile=$(echo ${subtitleFile//[$'\t\r\n']})

	echo $subtitleFile

	if [ $index -gt 0 ] 
 	then
 		cp papers/$paperfile ../../pdffigures2/paper.pdf

		cd ../../pdffigures2
		sbt "runMain org.allenai.pdffigures2.FigureExtractorBatchCli paper.pdf -g myPrefix"

		cp myPrefixpaper.json ../browsingMapping/server/paperData/$index.json

		cd ../browsingMapping/server

		mkdir ./frame/$index

		echo python computeSimilarity.py "subtitles/$subtitleFile" "./paperData/$index.json"

		python computeSimilarity.py "./videos/$videofile" "./subtitles/$subtitleFile" "./paperData/$index.json" "$index"
	fi

	index=$((index+1))

done < $INPUT
IFS=$OLDIFS

