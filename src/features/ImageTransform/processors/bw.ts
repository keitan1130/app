export const applyBlackWhite = (imageData: ImageData, threshold: number): ImageData => {
  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(data.length)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    const v = luma >= threshold ? 255 : 0

    newData[i] = v
    newData[i + 1] = v
    newData[i + 2] = v
    newData[i + 3] = a
  }

  return new ImageData(newData, width, height)
}
