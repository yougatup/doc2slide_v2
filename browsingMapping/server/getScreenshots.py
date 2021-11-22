#ncica & Data_sniffer solution remake
import cv2
import os
import time

step = 10
frames_count = 3
cam = cv2.VideoCapture('./example_video.mp4')

currentframe = 0
frame_per_second = cam.get(cv2.CAP_PROP_FPS) 
frames_captured = 0

while (True):
    ret, frame = cam.read()
    if ret:
        if currentframe > (step*frame_per_second):  
            currentframe = 0
            name = 'photo/frame' + str(frames_captured) + '.jpg'
            print(name)
            cv2.imwrite(name, frame)            
            frames_captured+=1
            if frames_captured>frames_count-1:
                ret = False
        currentframe += 1           
    if ret==False:
        break
cam.release()
cv2.destroyAllWindows()

