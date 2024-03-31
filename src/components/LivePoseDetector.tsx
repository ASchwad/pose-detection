import React, { useRef, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs-core'
import {
  Keypoint,
  SupportedModels,
  util,
  createDetector
} from '@tensorflow-models/pose-detection'
import { drawKeypoint, drawSkeleton } from '@/lib/canvasRenderer'

const LivePoseDetector: React.FC = () => {
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
        className="absolute inset-20"
        width="640"
        height="480"
        ref={videoRef}
        autoPlay
      />
      <canvas
        className="absolute inset-20"
        width="640"
        height="480"
        ref={canvasRef}
      />
    </>
  )
}

export default LivePoseDetector
