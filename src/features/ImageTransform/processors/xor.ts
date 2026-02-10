export const applyXor = (imageData: ImageData, seed: number): ImageData => {
  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(data.length)

  const mulberry32 = (seedValue: number) => {
    return () => {
      let t = (seedValue += 0x6d2b79f5)
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const random = mulberry32(seed)

  for (let i = 0; i < data.length; i++) {
    if ((i + 1) % 4 === 0) {
      newData[i] = data[i]
    } else {
      const randomValue = Math.floor(random() * 256)
      newData[i] = data[i] ^ randomValue
    }
  }

  return new ImageData(newData, width, height)
}
