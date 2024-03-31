import React, { useRef, useEffect, useState } from 'react'
import {
  createDetector,
  Keypoint,
  SupportedModels
} from '@tensorflow-models/pose-detection'
import { drawKeypoint, drawSkeleton } from '@/lib/canvasRenderer'
import * as tf from '@tensorflow/tfjs-core'

import ImageUploader from './ImageUploader'

const StaticPoseDetector: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const runPoseDetection = async () => {
      const canvas = canvasRef.current
      const width = 640
      const height = 480
      const model = SupportedModels.MoveNet

      await tf.ready()
      console.log('TF Ready')
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
            console.log(keypoints)
            if (canvas) {
              const ctx = canvas.getContext('2d')
              if (ctx) {
                ctx.clearRect(0, 0, width, height) // Clear canvas
                drawSkeleton(ctx, keypoints, model)
                keypoints.forEach((keypoint) => {
                  drawKeypoint(ctx, keypoint)
                })
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
