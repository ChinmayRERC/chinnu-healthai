#!/usr/bin/env python3
import argparse, csv, os
import cv2
import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose

def angle(a,b,c):
    a,b,c = np.array(a),np.array(b),np.array(c)
    ba,bc = a-b,c-b
    cos = np.dot(ba,bc)/(np.linalg.norm(ba)*np.linalg.norm(bc)+1e-8)
    return np.degrees(np.arccos(np.clip(cos,-1,1)))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--video', required=True)
    parser.add_argument('--label', required=True)
    parser.add_argument('--out', required=True)
    args = parser.parse_args()
    
    os.makedirs(os.path.dirname(args.out) or '.', exist_ok=True)
    pose = mp_pose.Pose(static_image_mode=False, model_complexity=1)
    cap = cv2.VideoCapture(args.video)
    
    with open(args.out,'a',newline='') as f:
        w = csv.writer(f)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            res = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if not res.pose_landmarks: continue
            lm = res.pose_landmarks.landmark
            h,wf = frame.shape[:2]
            pts = [(lm[i].x*wf,lm[i].y*h) for i in range(33)]
            # simple features
            feats = []
            feats.append(angle(pts[11],pts[13],pts[15]))
            feats.append(angle(pts[13],pts[11],pts[23]))
            feats.append(angle(pts[11],pts[23],pts[25]))
            feats.append(angle(pts[23],pts[25],pts[27]))
            feats.append(angle(pts[11],pts[23],pts[27]))
            # normalized
            sm = [(pts[11][0]+pts[12][0])/2,(pts[11][1]+pts[12][1])/2]
            hm = [(pts[23][0]+pts[24][0])/2,(pts[23][1]+pts[24][1])/2]
            torso = np.hypot(sm[0]-hm[0],sm[1]-hm[1])+1e-8
            for i in [0,11,12,13,14,15,16,23,24,25,26,27,28]:
                feats.extend([(pts[i][0]-hm[0])/torso,(pts[i][1]-hm[1])/torso,1.0])
            feats.extend([np.hypot(pts[11][0]-pts[12][0],pts[11][1]-pts[12][1])/torso, np.hypot(pts[23][0]-pts[24][0],pts[23][1]-pts[24][1])/torso])
            feats.extend([abs(pts[11][1]-pts[12][1]), abs(pts[23][1]-pts[24][1])])
            feats.extend([0,0,0,0,0])
            while len(feats)<96: feats.append(0)
            w.writerow([args.label]+feats[:96])
    cap.release()
    pose.close()
    print('done')

if __name__=='__main__':
    main()
