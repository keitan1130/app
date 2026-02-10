import { applyBlackWhite } from './bw'

export const applyQuantize = (imageData: ImageData, levels: number): ImageData => {
  const safeLevels = Math.min(8, Math.max(1, Math.floor(levels)))

  if (safeLevels <= 1) {
    return applyBlackWhite(imageData, 128)
  }

  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(data.length)
  const step = 255 / (safeLevels - 1)

  const quantize = (value: number) => {
    const quantized = Math.round(value / step) * step
    return Math.min(255, Math.max(0, Math.round(quantized)))
  }

  for (let i = 0; i < data.length; i += 4) {
    newData[i] = quantize(data[i])
    newData[i + 1] = quantize(data[i + 1])
    newData[i + 2] = quantize(data[i + 2])
    newData[i + 3] = data[i + 3]
  }

  return new ImageData(newData, width, height)
}
