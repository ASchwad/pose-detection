import React, { useRef, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs-core'
import * as posedetection from '@tensorflow-models/pose-detection'

const drawKeypoint = (
  ctx: CanvasRenderingContext2D,
  keypoint: posedetection.Keypoint
) => {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1
  const scoreThreshold = 0

  if (score >= scoreThreshold) {
    const circle = new Path2D()
    ctx.fillStyle = 'red'
    ctx.beginPath()
    circle.arc(keypoint.x, keypoint.y, 10, 0, 2 * Math.PI)
    ctx.fill(circle)
  }
}

const PoseDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null) // Annotate with the type
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const runPoseDetection = async () => {
      try {
        // Load the pose-detection model
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        })

        // Get access to the webcam
        const video = videoRef.current
        if (video && 'srcObject' in video) {
          video.srcObject = stream
          video.play()

          await tf.ready()
          console.log('TF Ready')
          posedetection
            .createDetector(posedetection.SupportedModels.PoseNet, {
              inputResolution: { width: 640, height: 480 },
              architecture: 'ResNet50',
              outputStride: 16
            })
            .then((detector) => {
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
                        // drawSkeleton(keypoints, ctx);
                        console.log(keypoints)
                        keypoints.forEach((keypoint) => {
                          drawKeypoint(ctx, keypoint)
                        })
                        // const { width, height } = canvas;

                        // // Draw the point
                        // ctx.clearRect(0, 0, width, height); // Clear canvas
                        // ctx.fillStyle = 'red';
                        // ctx.beginPath();
                        // ctx.arc(keypoints[0].x, keypoints[0].y, 5, 0, Math.PI * 2);
                        // ctx.fill();
                        // console.log(keypoints)
                      })
                    }
                  }
                  requestAnimationFrame(() => {
                    detectPoseInRealTime()
                  })
                }
                // return null;
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
      <p className="text-3xl font-bold underline">Hi</p>
      <div>
        <video
          className="absolute inset-0 h-full w-full"
          width="640"
          height="480"
          ref={videoRef}
        ></video>
        <canvas
          className="absolute inset-0 h-full w-full"
          width="640"
          height="480"
          ref={canvasRef}
        ></canvas>
      </div>
    </>
  )
}

export default PoseDetection
