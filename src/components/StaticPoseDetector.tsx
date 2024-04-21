import React, { useRef, useEffect, useState } from 'react'
import {
  createDetector,
  SupportedModels
} from '@tensorflow-models/pose-detection'
import { drawAngle, drawKeypoint, drawSkeleton } from '@/lib/canvasRenderer'

import ImageUploader from './ImageUploader'
import {
  areJointsAligned,
  calculateAngle,
  estimateBodyPositionToCamera,
  filterKeypoints
} from '@/lib/poseCalculations'

const StaticPoseDetector: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const runPoseDetection = async () => {
      const canvas = canvasRef.current
      const width = 640
      const height = 480
      const model = SupportedModels.MoveNet
      createDetector(model, {
        inputResolution: { width, height },
        architecture: 'ResNet50',
        outputStride: 16
      }).then((detector) => {
        const pixelInput = new Image()
        pixelInput.src = imageUrl as string
        pixelInput.width = width
        pixelInput.height = height

        detector.estimatePoses(pixelInput).then((poses) => {
          poses.forEach(({ keypoints }) => {
            if (canvas) {
              const ctx = canvas.getContext('2d')
              if (ctx) {
                const position = estimateBodyPositionToCamera(keypoints)

                const filtered_keypoints = filterKeypoints(keypoints, position)
                console.log(filtered_keypoints)
                ctx.clearRect(0, 0, width, height) // Clear canvas
                drawSkeleton(ctx, keypoints, model)
                filtered_keypoints.forEach((keypoint) => {
                  drawKeypoint(ctx, keypoint)
                })
                const shoulder = keypoints.find(
                  (keypoint) => keypoint.name?.includes('shoulder')!
                )
                const elbow = keypoints.find(
                  (keypoint) => keypoint.name?.includes('elbow')!
                )
                const hip = keypoints.find(
                  (keypoint) => keypoint.name?.includes('hip')!
                )
                const knee = keypoints.find(
                  (keypoint) => keypoint.name?.includes('knee')!
                )

                drawAngle(shoulder!, hip!, elbow!, ctx)
                drawAngle(hip!, knee!, shoulder!, ctx)
                const plankKeypointNames = filtered_keypoints
                  .map((keypoint) => keypoint.name!)
                  .filter(
                    (name) =>
                      name.includes('shoulder') ||
                      name.includes('hip') ||
                      name.includes('knee') ||
                      name.includes('ankle')
                  )
                console.log(
                  areJointsAligned(filtered_keypoints, plankKeypointNames)
                )
                return null
              }
            }
          })
        })
        return null
      })
    }
    runPoseDetection()
  }, [imageUrl])

  return (
    <div className="relative flex flex-col gap-5">
      <ImageUploader setImageUrl={setImageUrl} />
      <div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded"
            className="absolute"
            style={{ height: 480, maxWidth: 640, zIndex: -1 }}
          />
        )}
        <canvas width="640" height="480" ref={canvasRef} />
      </div>
    </div>
  )
}

export default StaticPoseDetector
