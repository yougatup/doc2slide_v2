import time
import numpy as np
import cv2
import imutils
import eventhook

class ChangeDetection:
    # minimum contour area (1000)
    frames = []
    minArea = 1000
    # maximum frames before firstFrame reset (3)
    maxIdle = 3
    # frame step size
    stepSize = 20
    # amount of percent between each progress event
    progressInterval = 1
    # event that fires when motion is confirmed
    onTrigger = eventhook.EventHook()
    # event that gives feedback of how far the detection is
    onProgress = eventhook.EventHook()

    def __init__(self, stepSize, progressInterval, showDebug=False):
        self.frames = []
        self.selectedFrames = []
        self.stepSize = stepSize
        self.progressInterval = progressInterval
        self.showDebug = showDebug

    def start(self, camera):
        firstFrame = None
        firstFrameCount = None
        firstTime = None

        prevFrame = None
        prevFrameCount = None
        prevTime = None
        # amount of contours
        contAmount = 0

        # amount of idle frames that were the same
        # used to determine if that frame should become the new firstFrame
        idleCount = 0

        # current pos in vid
        currentPosition = 0
        lastProgress = 0

        startTime = time.time()

        print('change detection initiated')
        print(camera.get(cv2.CAP_PROP_FPS))

        totalFrames = camera.get(cv2.CAP_PROP_FRAME_COUNT) - 1
        cnt = 0

        while currentPosition < totalFrames:
            (grabbed, frame) = camera.read()

            if frame is None:
                break

            # frame = frame[:, 640:1280]
            frame = frame[:, 0:640]

            self.frames.append({
                "frame": frame.copy(),
                "curPos": camera.get(cv2.CAP_PROP_POS_FRAMES)
            })

            original = frame.copy()

            # convert grabbed frame to gray and blur
            frame = imutils.resize(frame, width=500)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (21, 21), 0)

            if firstFrame is None:
                firstFrame = np.zeros(gray.shape, np.uint8)
                firstFrameCount = camera.get(cv2.CAP_PROP_POS_FRAMES)
                firstTime = camera.get(cv2.CAP_PROP_POS_MSEC)

                print(firstFrame, firstFrameCount, firstTime)
            if prevFrame is None:
                prevFrame = np.zeros(gray.shape, np.uint8)
                prevFrameCount = camera.get(cv2.CAP_PROP_POS_FRAMES)
                prevTime = camera.get(cv2.CAP_PROP_POS_MSEC)

            frameDelta = cv2.absdiff(firstFrame, gray)
            thresh = self.calcThresh(frameDelta)
            cnts = self.detectContours(thresh)

            # we have motion, possible new firstFrame?
            if len(cnts) > 0:
                prevDelta = cv2.absdiff(prevFrame, gray)
                prevThresh = self.calcThresh(prevDelta)
                # we have no changes from the previous frame
                if cv2.countNonZero(prevThresh) == 0:
                    idleCount += 1
                else:
                    idleCount = 0

            # we have now seen the same image for too long, reset firstImage
            if idleCount > self.maxIdle:
                print(currentPosition, totalFrames)
                print(currentPosition/30)

                print(camera.get(cv2.CAP_PROP_POS_FRAMES))
                print("+++++", firstFrameCount, firstTime)
                print("-----", prevFrameCount, prevTime)

                firstFrame = prevFrame
                firstFrameCount = prevFrameCount
                firstTime = prevTime

                self.selectedFrames.append(original)
                self.onTrigger.fire(original)

                idleCount = 0

            prevFrame = gray
            prevFrameCount = camera.get(cv2.CAP_PROP_POS_FRAMES)
            prevTime = camera.get(cv2.CAP_PROP_POS_MSEC)

            progress = (currentPosition / totalFrames) * 100

            if progress - lastProgress >= self.progressInterval:
                lastProgress = progress
                self.onProgress.fire(progress, currentPosition)

            camera.set(1, min(currentPosition +
                              self.stepSize, totalFrames))

            currentPosition = camera.get(cv2.CAP_PROP_POS_FRAMES)

            if self.showDebug:
                # loop over the contours
                for c in cnts:
                    # compute the bounding box for the contour, draw it on the frame
                    (x, y, w, h) = cv2.boundingRect(c)
                    cv2.rectangle(frame, (x, y), (x + w, y + h),
                                  (0, 255, 0), 2)

                cv2.putText(frame, "contours: " + str(contAmount),
                            (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                cv2.putText(frame, "idle: " + str(idleCount), (140, 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                cv2.putText(frame, "frame: " + str(currentPosition), (10, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

                cv2.imshow("Frame", frame)
                cv2.imshow("Delta", frameDelta)
                cv2.imshow("Threshold", thresh)

                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break

        camera.release()
        cv2.destroyAllWindows()

        print(len(self.frames))
        print(len(self.selectedFrames))

        dist = []

        f = open("frameResult.txt", "w")

        for i in range(len(self.selectedFrames)) :
            tmp = []

            _f1 = imutils.resize(self.selectedFrames[i], width=500)
            _g1 = cv2.cvtColor(self.selectedFrames[i], cv2.COLOR_BGR2GRAY)
            _g1 = cv2.GaussianBlur(_g1, (21, 21), 0)

            print(i)

            for j in range(len(self.frames)) :
                _f2 = imutils.resize(self.frames[j]["frame"], width=500)
                _g2 = cv2.cvtColor(self.frames[j]["frame"], cv2.COLOR_BGR2GRAY)
                _g2 = cv2.GaussianBlur(_g2, (21, 21), 0)

                delta = cv2.absdiff(_g1, _g2)
                thresh = self.calcThresh(delta)
                cnts = self.detectContours(thresh)

                tmp.append(len(cnts))

            f.write('\t'.join(map(str, tmp)))
            f.write('\n')

        print(tmp)

    def calcThresh(self, frame):
        thresh = cv2.threshold(frame, 25, 255, cv2.THRESH_BINARY)[1]
        return cv2.dilate(thresh, None, iterations=2)

    def detectContours(self, thresh):
        cnts = cv2.findContours(
            thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        # cnts = cnts[0] if imutils.is_cv2() else cnts[1]
        cnts = cnts[0]

        validCnts = []

        # loop over the contours
        for c in cnts:
            # if the contour is too small, ignore it
            if cv2.contourArea(c) < self.minArea:
                continue

            validCnts.append(c)

        return validCnts
