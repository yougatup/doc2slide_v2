for q in ./video.mp4
do
    echo $q

    echo "mkdir $q""_slides"
    mkdir $q""_slides

    echo "python main.py -v $q -o $q""_slides"
    python main.py -v $q -o $q"_slides"
done
