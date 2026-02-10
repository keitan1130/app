export const applyPixelate = (imageData: ImageData, blockSize: number): ImageData => {
  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(data)
  const size = Math.max(1, Math.floor(blockSize))

  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      let rSum = 0
      let gSum = 0
      let bSum = 0
      let aSum = 0
      let count = 0

      const blockW = Math.min(size, width - x)
      const blockH = Math.min(size, height - y)

      for (let by = 0; by < blockH; by += 1) {
        for (let bx = 0; bx < blockW; bx += 1) {
          const i = ((y + by) * width + (x + bx)) * 4
          rSum += data[i]
          gSum += data[i + 1]
          bSum += data[i + 2]
          aSum += data[i + 3]
          count += 1
        }
      }

      const rAvg = Math.round(rSum / count)
      const gAvg = Math.round(gSum / count)
      const bAvg = Math.round(bSum / count)
      const aAvg = Math.round(aSum / count)

      for (let by = 0; by < blockH; by += 1) {
        for (let bx = 0; bx < blockW; bx += 1) {
          const i = ((y + by) * width + (x + bx)) * 4
          newData[i] = rAvg
          newData[i + 1] = gAvg
          newData[i + 2] = bAvg
          newData[i + 3] = aAvg
        }
      }
    }
  }

  return new ImageData(newData, width, height)
}
