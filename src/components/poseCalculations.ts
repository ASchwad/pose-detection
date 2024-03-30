import { Keypoint } from '@tensorflow-models/pose-detection'

/*
Head to left wrist distance (Used points: 0,7)
Head to right wrist distance (Used points: 0,4)
Angle between left shoulder and left wrist (Used points: 7,6,5)
Angle between right shoulder and right wrist (Used points: 4,3,2)
Angle between left hip and left ankle (Used points: 11,12,13)
Angle between right hip and right ankle (Used points: 8,9,10)

https://github.com/augmentedstartups/Pose-Estimation/tree/master/5.%20Plank%20Pose%20Corrector
*/
export function isPlank(keypoints: Keypoint[]): boolean {
  const keypointsDict: { [key: string]: [number, number] } = {}
  keypoints.forEach((kp) => {
    keypointsDict[kp.name!] = [kp.x, kp.y]
  })

  function distance(kp1: string, kp2: string): number {
    const [x1, y1] = keypointsDict[kp1]
    const [x2, y2] = keypointsDict[kp2]
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }

  const angleThreshold = 10 // in degrees
  const distanceThreshold = 50 // in pixels

  if (
    Math.abs(
      keypointsDict['left_shoulder'][1] - keypointsDict['left_elbow'][1]
    ) < distanceThreshold &&
    Math.abs(
      keypointsDict['right_shoulder'][1] - keypointsDict['right_elbow'][1]
    ) < distanceThreshold &&
    Math.abs(keypointsDict['left_elbow'][1] - keypointsDict['left_wrist'][1]) <
      distanceThreshold &&
    Math.abs(
      keypointsDict['right_elbow'][1] - keypointsDict['right_wrist'][1]
    ) < distanceThreshold &&
    Math.abs(keypointsDict['left_shoulder'][0] - keypointsDict['left_hip'][0]) <
      distanceThreshold &&
    Math.abs(
      keypointsDict['right_shoulder'][0] - keypointsDict['right_hip'][0]
    ) < distanceThreshold &&
    Math.abs(keypointsDict['left_hip'][1] - keypointsDict['left_knee'][1]) <
      distanceThreshold &&
    Math.abs(keypointsDict['right_hip'][1] - keypointsDict['right_knee'][1]) <
      distanceThreshold &&
    Math.abs(keypointsDict['left_knee'][1] - keypointsDict['left_ankle'][1]) <
      distanceThreshold &&
    Math.abs(keypointsDict['right_knee'][1] - keypointsDict['right_ankle'][1]) <
      distanceThreshold &&
    Math.abs(
      distance('left_elbow', 'left_shoulder') -
        distance('left_wrist', 'left_elbow')
    ) < distanceThreshold &&
    Math.abs(
      distance('right_elbow', 'right_shoulder') -
        distance('right_wrist', 'right_elbow')
    ) < distanceThreshold &&
    Math.abs(
      distance('left_knee', 'left_hip') - distance('left_ankle', 'left_knee')
    ) < distanceThreshold &&
    Math.abs(
      distance('right_knee', 'right_hip') -
        distance('right_ankle', 'right_knee')
    ) < distanceThreshold
  ) {
    return true
  } else {
    return false
  }
}
