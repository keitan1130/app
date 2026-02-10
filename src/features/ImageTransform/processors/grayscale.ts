export const applyGrayscale = (imageData: ImageData): ImageData => {
  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(data.length)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b)

    newData[i] = luma
    newData[i + 1] = luma
    newData[i + 2] = luma
    newData[i + 3] = a
  }

  return new ImageData(newData, width, height)
}
