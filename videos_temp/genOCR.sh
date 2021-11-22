for q in ./*.mp4
do
    echo $q

    filename=${q:2}

    cd $filename"_slides"
    pwd

    for index in ./*.jpg
    do
        echo $index

        python ../ocr.py --image $index > $index"_OCR.txt"
    done

    cd ..

done
