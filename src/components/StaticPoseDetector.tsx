import React, { useRef, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs-core'
import {
  Keypoint,
  SupportedModels,
  util,
  createDetector
} from '@tensorflow-models/pose-detection'
import { drawKeypoint, drawSkeleton } from '@/lib/canvasRenderer'
// impprt example_keypoints.json
import exampleKeypoints from './example_plank_keypoints.json'
import ImageUploadComponent from './ImageUploader'
import ImageUploader from './ImageUploader'

const StaticPoseDetector: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const width = 640
    const height = 480
    const model = SupportedModels.MoveNet
    const keypoints = exampleKeypoints as Keypoint[]

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
  }, [])

  return (
    <>
      <ImageUploader />
      <canvas
        className="absolute inset-20"
        width="640"
        height="480"
        ref={canvasRef}
      />
    </>
  )
}

export default StaticPoseDetector
