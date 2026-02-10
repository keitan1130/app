export const applyInvert = (imageData: ImageData): ImageData => {
  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(data.length)

  for (let i = 0; i < data.length; i += 4) {
    newData[i] = 255 - data[i]
    newData[i + 1] = 255 - data[i + 1]
    newData[i + 2] = 255 - data[i + 2]
    newData[i + 3] = data[i + 3]
  }

  return new ImageData(newData, width, height)
}
