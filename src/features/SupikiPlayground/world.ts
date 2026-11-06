import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { type ThemeId, themeById } from './types'

const C = {
  cream: '#fff2d6',
  wood: '#d5a778',
  grass: '#b6cc8d',
  green: '#7a9d78',
  pink: '#e9a7a5',
  red: '#d96c56',
  ink: '#57564d',
  yellow: '#efc76d',
  blue: '#9ebcc5',
}

export const material = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.78, ...extra })

export const canvasTexture = (
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D) => void
) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable')
  paint(context)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export const box = (
  parent: THREE.Object3D,
  size: [number, number, number],
  color: string,
  position: [number, number, number],
  radius = 0.08
) => {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, radius), material(color))
  mesh.position.set(...position)
  mesh.castShadow = radius > 0.09
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

export const ball = (
  parent: THREE.Object3D,
  radius: number,
  color: string,
  position: [number, number, number],
  scale?: [number, number, number]
) => {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), material(color))
  mesh.position.set(...position)
  if (scale) mesh.scale.set(...scale)
  mesh.castShadow = radius > 0.09
  parent.add(mesh)
  return mesh
}

export const cylinder = (
  parent: THREE.Object3D,
  radius: number,
  height: number,
  color: string,
  position: [number, number, number]
) => {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 32),
    material(color)
  )
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

export const makeStarGeometry = (radius = 1) => {
  const shape = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 + Math.PI / 2
    const r = radius * (i % 2 === 0 ? 1 : 0.45)
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false })
}

export const textPlane = (
  parent: THREE.Object3D,
  text: string,
  width: number,
  height: number,
  position: [number, number, number],
  background = C.cream,
  ink = C.ink
) => {
  const texture = canvasTexture(768, 256, (ctx) => {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, 768, 256)
    ctx.fillStyle = ink
    ctx.font = 'bold 72px "Hiragino Maru Gothic ProN", "Noto Sans CJK JP", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 384, 132)
  })
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture })
  )
  mesh.position.set(...position)
  parent.add(mesh)
  return mesh
}

export const createWorld = (scene: THREE.Scene, theme: ThemeId = 'garden') => {
  const skin = themeById(theme)
  const world = new THREE.Group()
  scene.add(world)

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), material(skin.ground))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.72
  ground.receiveShadow = true
  scene.add(ground)

  // A shallow wooden tray, rather than an endless virtual floor.
  box(world, [12.3, 0.5, 8.6], skin.wood, [0, -0.36, 0], 0.22)
  box(world, [12.1, 0.18, 8.4], C.cream, [0, -0.11, 0], 0.18)
  const lawn = box(world, [11.8, 0.08, 8.1], C.grass, [0, 0.01, 0], 0.16)
  const lawnTexture = canvasTexture(1024, 1024, (ctx) => {
    ctx.fillStyle = '#b5ca91'
    ctx.fillRect(0, 0, 1024, 1024)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = skin.checks[(x + y) % 2]
        ctx.fillRect(x * 64, y * 64, 64, 64)
      }
    }
    // A tiny embroidered border and the occasional tuft of grass.
    ctx.strokeStyle = '#d7dfb2'
    ctx.lineWidth = 5
    ctx.setLineDash([12, 12])
    ctx.strokeRect(20, 20, 984, 984)
    ctx.setLineDash([])
    ctx.strokeStyle = '#96b479'
    ctx.lineWidth = 2
    for (let i = 0; i < 50; i++) {
      const x = 50 + ((i * 173) % 920)
      const y = 50 + ((i * 281) % 920)
      ctx.beginPath()
      ctx.moveTo(x - 4, y - 4)
      ctx.lineTo(x, y)
      ctx.lineTo(x + 3, y - 5)
      ctx.stroke()
    }
  })
  lawn.material.map = lawnTexture
  lawn.material.color.set('#ffffff')

  // A little front nameplate, with two actual brass screws.
  const nameplate = box(world, [2.65, 0.42, 0.07], C.cream, [0.8, -0.27, 4.315], 0.04)
  textPlane(nameplate, skin.name, 2.2, 0.35, [0, 0, 0.04])
  ball(nameplate, 0.035, '#aa8655', [-1.19, 0, 0.05])
  ball(nameplate, 0.035, '#aa8655', [1.19, 0, 0.05])
  const baseParts = new Set(world.children)

  // The trampoline has a stitched rim, a fabric bed, and visible feet.
  const trampoline = new THREE.Group()
  trampoline.position.set(-3.65, 0, 0.65)
  trampoline.userData.action = 'jump'
  world.add(trampoline)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    cylinder(trampoline, 0.065, 0.34, C.cream, [Math.cos(angle), 0.19, Math.sin(angle)])
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.14, 12, 48), material('#cfa3a4'))
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.4
  rim.castShadow = true
  trampoline.add(rim)
  const bed = cylinder(trampoline, 0.95, 0.07, '#f6d8cb', [0, 0.37, 0])
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2
    ball(trampoline, 0.035, C.cream, [Math.cos(angle) * 1.04, 0.52, Math.sin(angle) * 1.04])
  }
  const bedStar = new THREE.Mesh(makeStarGeometry(0.34), material('#d6908a'))
  bedStar.rotation.x = -Math.PI / 2
  bedStar.position.y = 0.414
  trampoline.add(bedStar)

  // A slightly lopsided mint radio. Its buttons are raycastable scene objects.
  const radio = new THREE.Group()
  radio.position.set(3.7, 0.1, -2.3)
  radio.rotation.y = -0.15
  radio.userData.action = 'radio'
  world.add(radio)
  box(radio, [2.3, 1.37, 0.8], '#86aaa4', [0, 0.79, 0], 0.16)
  box(radio, [2.08, 1.12, 0.07], '#a4c1b5', [0, 0.79, 0.43], 0.12)
  box(radio, [1.15, 0.11, 0.12], C.cream, [0.07, 1.59, 0], 0.04)
  box(radio, [0.12, 0.28, 0.12], C.cream, [-0.49, 1.47, 0], 0.03)
  box(radio, [0.12, 0.28, 0.12], C.cream, [0.59, 1.47, 0], 0.03)
  const speaker = new THREE.Mesh(new THREE.CircleGeometry(0.41, 32), material('#627b73'))
  speaker.position.set(-0.53, 0.77, 0.48)
  radio.add(speaker)
  for (let row = -3; row <= 3; row++) {
    for (let col = -3; col <= 3; col++) {
      if (row * row + col * col > 10) continue
      ball(radio, 0.026, '#c9d4b9', [-0.53 + col * 0.094, 0.77 + row * 0.094, 0.485])
    }
  }
  const radioFace = textPlane(radio, 'ﾁｮﾜﾖ FM', 0.93, 0.35, [0.53, 1.03, 0.48], '#f8e8b8')
  radioFace.userData.action = 'radio'
  const dial = cylinder(radio, 0.16, 0.1, C.cream, [0.79, 0.58, 0.51])
  dial.rotation.x = Math.PI / 2
  const radioBars: THREE.Mesh[] = []
  for (let i = 0; i < 5; i++) {
    radioBars.push(box(radio, [0.065, 0.12, 0.025], '#f5d786', [0.18 + i * 0.1, 0.58, 0.49], 0.01))
  }
  box(radio, [0.42, 0.13, 0.3], C.red, [-0.55, 1.51, 0.15], 0.04)

  // The snack cloth and a cinnamon-candy jar.
  const snack = new THREE.Group()
  snack.position.set(3.3, 0.065, 1.7)
  snack.userData.action = 'snack'
  world.add(snack)
  const cloth = box(snack, [2.6, 0.045, 1.9], '#fff0d9', [0, 0, 0], 0.08)
  cloth.material.map = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#f7ead8'
    ctx.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#e6b9ab99'
      ctx.fillRect(i * 32, 0, 16, 256)
      ctx.fillRect(0, i * 32, 256, 16)
    }
  })
  cloth.material.color.set('#ffffff')
  cylinder(snack, 0.43, 0.08, C.cream, [0.36, 0.07, 0])
  cylinder(snack, 0.31, 0.48, '#e1b879', [0.36, 0.32, 0])
  cylinder(snack, 0.34, 0.09, C.red, [0.36, 0.61, 0])
  textPlane(snack, 'あめ', 0.43, 0.21, [0.36, 0.34, 0.32], '#fff2d6', '#a36548')
  for (let i = 0; i < 3; i++) {
    const sweet = ball(snack, 0.1, i === 1 ? '#c7998b' : C.yellow, [-0.5 + i * 0.23, 0.13, 0.35])
    sweet.scale.set(1.3, 0.7, 1)
  }

  // A pumpkin patch, not pumpkin soup. Someone has been taking good care of it.
  const garden = new THREE.Group()
  garden.position.set(-3.5, 0.05, -2.5)
  garden.userData.action = 'snack'
  world.add(garden)
  const pumpkins: THREE.Group[] = []
  for (let i = 0; i < 3; i++) {
    const pumpkin = new THREE.Group()
    pumpkin.position.set((i - 1) * 0.71, 0.05, (i % 2) * -0.45)
    const size = i === 1 ? 0.34 : 0.27
    for (let j = 0; j < 7; j++) {
      const angle = (j / 7) * Math.PI * 2
      ball(
        pumpkin,
        size,
        j % 2 ? '#df914c' : '#eaa359',
        [Math.cos(angle) * size * 0.42, size * 0.8, Math.sin(angle) * size * 0.42],
        [0.75, 0.83, 0.75]
      )
    }
    const stem = cylinder(pumpkin, 0.055, 0.2, C.green, [0, size * 1.8, 0])
    stem.rotation.z = -0.25
    garden.add(pumpkin)
    pumpkins.push(pumpkin)
  }

  // The low-gravity switch is a tiny hand-built rocket with a red button.
  const rocket = new THREE.Group()
  rocket.position.set(0.5, 0.05, -2.8)
  rocket.userData.action = 'float'
  world.add(rocket)
  cylinder(rocket, 0.5, 0.14, '#b29a85', [0, 0.07, 0])
  cylinder(rocket, 0.22, 0.8, C.cream, [0, 0.53, 0])
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.4, 24), material(C.red))
  nose.position.y = 1.13
  nose.castShadow = true
  rocket.add(nose)
  ball(rocket, 0.085, C.blue, [0, 0.68, 0.21], [1, 1, 0.35])
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2
    const fin = box(
      rocket,
      [0.09, 0.35, 0.32],
      C.red,
      [Math.sin(angle) * 0.24, 0.32, Math.cos(angle) * 0.24],
      0.035
    )
    fin.rotation.y = angle
  }

  // Fence, fairy lights, and a pinwheel lend scale to the paper inhabitants.
  for (let i = 0; i < 13; i++)
    box(world, [0.11, 0.65, 0.11], C.cream, [-5.4 + i * 0.9, 0.36, -3.68], 0.035)
  box(world, [11.05, 0.08, 0.08], C.cream, [0, 0.48, -3.68], 0.025)
  const cablePoints: THREE.Vector3[] = []
  for (let i = 0; i <= 24; i++) {
    const x = -5.35 + (i / 24) * 10.7
    cablePoints.push(new THREE.Vector3(x, 2.5 - Math.sin((i / 24) * Math.PI) * 0.65, -3.6))
  }
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePoints), 32, 0.012, 5, false),
    material('#8e8b70')
  )
  world.add(cable)
  for (const x of [-5.4, 5.4]) cylinder(world, 0.045, 2.5, C.wood, [x, 1.3, -3.6])
  const bulbs: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>[] = []
  for (let i = 0; i < 13; i++) {
    const x = -4.95 + (i / 12) * 9.9
    const y = 2.45 - Math.sin(((i + 0.5) / 13) * Math.PI) * 0.65
    const bulb = ball(world, 0.085, [C.yellow, C.pink, C.blue, C.cream][i % 4], [x, y - 0.1, -3.6])
    bulb.material.emissive.set(bulb.material.color)
    bulbs.push(bulb)
  }

  const pinwheel = new THREE.Group()
  pinwheel.position.set(-5.05, 1.6, -1.65)
  cylinder(world, 0.035, 1.7, C.wood, [-5.05, 0.85, -1.65])
  for (let i = 0; i < 4; i++) {
    const petal = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.5, 3),
      material([C.pink, C.yellow, C.blue, C.cream][i])
    )
    const angle = (i * Math.PI) / 2
    petal.position.set(Math.sin(angle) * 0.25, Math.cos(angle) * 0.25, 0)
    petal.rotation.z = -angle - 0.45
    pinwheel.add(petal)
  }
  ball(pinwheel, 0.08, C.cream, [0, 0, 0.03])
  world.add(pinwheel)

  // Three clover-like felt trees. The silhouette is intentionally toy-sized.
  for (const [x, z, size] of [
    [-5.1, -2.9, 0.8],
    [5.0, -3.0, 0.65],
    [5.2, 2.8, 0.5],
  ]) {
    cylinder(world, 0.08, size, C.wood, [x, size / 2, z])
    for (let j = 0; j < 3; j++) {
      const angle = (j / 3) * Math.PI * 2
      ball(
        world,
        size * 0.45,
        j === 1 ? '#8eac79' : '#a2bb86',
        [x + Math.cos(angle) * size * 0.25, size + Math.sin(angle) * size * 0.2, z],
        [1, 1, 0.7]
      )
    }
  }

  // Scattered daisies, modelled rather than painted into the scene.
  for (let i = 0; i < 16; i++) {
    const x = Math.sin(i * 19.73) * 5.4
    const z = Math.cos(i * 13.13) * 3.5
    if (Math.abs(x) < 2 && Math.abs(z) < 1.6) continue
    const flower = new THREE.Group()
    flower.position.set(x, 0.08, z)
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2
      ball(
        flower,
        0.065,
        C.cream,
        [Math.cos(angle) * 0.08, 0, Math.sin(angle) * 0.08],
        [1, 0.35, 1]
      )
    }
    ball(flower, 0.05, C.yellow, [0, 0.02, 0], [1, 0.5, 1])
    world.add(flower)
  }

  if (theme !== 'garden') {
    for (const child of world.children) {
      if (
        !baseParts.has(child) &&
        ![trampoline, radio, snack, rocket].includes(child as THREE.Group)
      )
        child.visible = false
    }
    if (theme === 'factory') bed.material.color.set('#d8ba68')
    if (theme === 'cafe') bed.material.color.set('#e6b77c')
    if (theme === 'moon') bed.material.color.set('#b0bdd6')
  }

  return {
    world,
    ground,
    trampoline,
    bed,
    radio,
    radioBars,
    snack,
    rocket,
    pumpkins,
    bulbs,
    pinwheel,
    targets: [trampoline, radio, snack, rocket, garden],
  }
}

export type PlaygroundWorld = ReturnType<typeof createWorld>
