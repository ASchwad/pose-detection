import React, { useRef, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs-core'
import {
  Keypoint,
  SupportedModels,
  util,
  createDetector
} from '@tensorflow-models/pose-detection'
import { isPlank } from './poseCalculations'

const drawKeypoint = (ctx: CanvasRenderingContext2D, keypoint: Keypoint) => {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1
  const scoreThreshold = 0.3

  if (score >= scoreThreshold) {
    const circle = new Path2D()
    ctx.fillStyle = 'red'
    ctx.beginPath()
    circle.arc(keypoint.x, keypoint.y, 10, 0, 2 * Math.PI)
    ctx.fill(circle)
  }
}

const drawSkeleton = (
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  model: SupportedModels
) => {
  // Each poseId is mapped to a color in the color palette.
  const color = 'White'
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 2

  util.getAdjacentPairs(model).forEach(([i, j]) => {
    const kp1 = keypoints[i]
    const kp2 = keypoints[j]

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1
    const score2 = kp2.score != null ? kp2.score : 1
    const scoreThreshold = 0.3

    if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
      ctx.beginPath()
      ctx.moveTo(kp1.x, kp1.y)
      ctx.lineTo(kp2.x, kp2.y)
      ctx.stroke()
    }
  })
}

const PoseDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null) // Annotate with the type
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const runPoseDetection = async () => {
      try {
        const model = SupportedModels.MoveNet
        // Load the pose-detection model
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        })

        // Get access to the webcam
        const video = videoRef.current
        console.log('Video', video)
        const width = 640
        const height = 480

        if (video && 'srcObject' in video) {
          video.srcObject = stream
          video.play()

          await tf.ready()
          console.log('TF Ready')
          createDetector(model, {
            inputResolution: { width, height },
            architecture: 'ResNet50',
            outputStride: 16
          }).then((detector) => {
            const detectPoseInRealTime = async () => {
              const video = videoRef.current
              if (video) {
                const poses = await detector.estimatePoses(video)
                // Set canvas dimensions
                const canvas = canvasRef.current
                if (canvas) {
                  canvas.width = video.videoWidth
                  canvas.height = video.videoHeight

                  // Draw poses on canvas
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    poses.forEach(({ keypoints }) => {
                      ctx.clearRect(0, 0, width, height) // Clear canvas
                      drawSkeleton(ctx, keypoints, model)
                      keypoints.forEach((keypoint) => {
                        drawKeypoint(ctx, keypoint)
                      })
                    })
                  }
                }
                requestAnimationFrame(() => {
                  detectPoseInRealTime()
                })
              }
              return null
            }
            detectPoseInRealTime()
          })
        }
      } catch (error) {
        console.error(
          'Error loading pose-detection model or accessing webcam:',
          error
        )
      }
    }

    runPoseDetection()

    // Cleanup function
    return () => {
      const video = videoRef.current
      if (video) {
        const stream = video.srcObject
        if (stream instanceof MediaStream) {
          const tracks = stream.getTracks()
          tracks.forEach((track) => track.stop())
        }
      }
    }
  }, [])

  return (
    <>
      <video
        className="absolute inset-0"
        width="640"
        height="480"
        ref={videoRef}
        autoPlay
      />
      <canvas
        className="absolute inset-0"
        width="640"
        height="480"
        ref={canvasRef}
      />
    </>
  )
}

export default PoseDetection
