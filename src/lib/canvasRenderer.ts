import {
  Keypoint,
  SupportedModels,
  util
} from '@tensorflow-models/pose-detection'

export const drawKeypoint = (
  ctx: CanvasRenderingContext2D,
  keypoint: Keypoint
) => {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1
  const scoreThreshold = 0.3

  if (score >= scoreThreshold) {
    const circle = new Path2D()
    ctx.fillStyle = 'red'
    if (score < 0.5) {
      ctx.fillStyle = 'yellow'
    } else {
      ctx.fillStyle = 'green'
    }

    ctx.beginPath()
    circle.arc(keypoint.x, keypoint.y, 10, 0, 2 * Math.PI)
    ctx.fill(circle)
  }
}

export const drawSkeleton = (
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  model: SupportedModels
) => {
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
