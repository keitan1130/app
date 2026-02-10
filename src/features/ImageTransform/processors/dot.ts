export const applyDotEffect = (
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  dotSize: number
) => {
  const { width, height, data } = imageData
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  const radiusMax = dotSize / 2

  for (let y = 0; y < height; y += dotSize) {
    for (let x = 0; x < width; x += dotSize) {
      const centerX = Math.min(x + radiusMax, width - 1)
      const centerY = Math.min(y + radiusMax, height - 1)
      const index = (Math.floor(centerY) * width + Math.floor(centerX)) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]

      const luma = 0.299 * r + 0.587 * g + 0.114 * b
      const radius = radiusMax * (1 - luma / 255)

      if (radius <= 0.25) continue

      ctx.beginPath()
      ctx.fillStyle = '#111111'
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
