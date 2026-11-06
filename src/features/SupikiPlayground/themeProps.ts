import * as THREE from 'three'
import { type Gimmick, type ThemeId, themeById } from './types'
import {
  ball,
  box,
  cylinder,
  makeStarGeometry,
  material,
  type PlaygroundWorld,
  textPlane,
} from './world'

export const disposeObject = (root: THREE.Object3D) => {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Sprite)) return
    if (object instanceof THREE.Mesh) geometries.add(object.geometry)
    for (const entry of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(entry)
      for (const value of Object.values(entry))
        if (value instanceof THREE.Texture) textures.add(value)
    }
  })
  for (const geometry of geometries) geometry.dispose()
  for (const entry of materials) entry.dispose()
  for (const texture of textures) texture.dispose()
  root.removeFromParent()
}

export const decorateTheme = (world: PlaygroundWorld, theme: ThemeId) => {
  const props = new Map<Gimmick, THREE.Group>()
  const parts = new Map<Gimmick, THREE.Object3D[]>()
  const addRotor = (parent: THREE.Group, color: string) => {
    const rotor = new THREE.Group()
    for (let i = 0; i < 4; i++) {
      const blade = box(rotor, [0.24, 0.68, 0.08], color, [0, 0.3, 0], 0.06)
      blade.position.set(Math.sin((i * Math.PI) / 2) * 0.3, Math.cos((i * Math.PI) / 2) * 0.3, 0)
      blade.rotation.z = (-i * Math.PI) / 2
    }
    ball(rotor, 0.13, '#fff0cf', [0, 0, 0.06])
    rotor.position.y = 1
    parent.add(rotor)
    return rotor
  }
  for (const spec of themeById(theme).gimmicks) {
    const group = new THREE.Group()
    group.position.set(spec.position[0], 0.08, spec.position[1])
    group.userData.action = spec.id
    world.world.add(group)
    props.set(spec.id, group)
    parts.set(spec.id, [])
    switch (spec.id) {
      case 'wind':
      case 'fan': {
        cylinder(group, 0.4, 0.13, '#c6b394', [0, 0.07, 0])
        cylinder(group, 0.065, 0.9, '#9baca0', [0, 0.5, 0])
        const rotor = addRotor(group, spec.id === 'fan' ? '#d3a966' : '#9ebec5')
        const guard = new THREE.Mesh(
          new THREE.TorusGeometry(0.65, 0.035, 8, 32),
          material('#718e8b')
        )
        guard.position.set(0, 1, 0.04)
        group.add(guard)
        parts.set(spec.id, [rotor])
        break
      }
      case 'sprinkler': {
        cylinder(group, 0.38, 0.12, '#90aaa2', [0, 0.06, 0])
        cylinder(group, 0.08, 0.7, '#c2b18b', [0, 0.4, 0])
        const nozzle = box(group, [0.8, 0.16, 0.16], '#91b2ba', [0, 0.8, 0], 0.07)
        ball(group, 0.12, '#e6bd79', [0, 0.92, 0])
        parts.set(spec.id, [nozzle])
        break
      }
      case 'bell': {
        const bell = new THREE.Group()
        group.add(bell)
        const body = new THREE.Mesh(
          new THREE.ConeGeometry(0.34, 0.5, 24, 1, true),
          material('#ddbc76')
        )
        body.position.y = 0.55
        bell.add(body)
        ball(bell, 0.1, '#a98f5c', [0, 0.29, 0])
        cylinder(bell, 0.06, 0.23, '#a98664', [0, 0.92, 0])
        cylinder(group, 0.45, 0.08, '#f8ecd2', [0, 0.04, 0])
        parts.set(spec.id, [bell])
        break
      }
      case 'bait': {
        box(group, [0.8, 0.5, 0.55], '#b6c5ac', [0, 0.28, 0], 0.1)
        textPlane(group, '？', 0.45, 0.35, [0, 0.3, 0.285], '#f4e9d1')
        const sweet = ball(group, 0.2, '#e9b6a6', [0, 0.75, 0])
        parts.set(spec.id, [sweet])
        break
      }
      case 'hammer': {
        cylinder(group, 0.45, 0.12, '#c0a782', [0, 0.06, 0])
        const hammer = new THREE.Group()
        hammer.position.y = 0.4
        group.add(hammer)
        cylinder(hammer, 0.07, 1.4, '#aa825e', [0, 0.7, 0])
        box(hammer, [1.05, 0.5, 0.5], '#de9476', [0, 1.45, 0], 0.14)
        textPlane(hammer, 'もち', 0.7, 0.3, [0, 1.45, 0.26], '#e3a185', '#694e46')
        parts.set(spec.id, [hammer])
        break
      }
      case 'conveyor': {
        box(group, [2.6, 0.22, 0.9], '#5f7a79', [0, 0.2, 0], 0.1)
        const strips: THREE.Object3D[] = []
        for (let i = 0; i < 10; i++)
          strips.push(box(group, [0.07, 0.03, 0.83], '#c5d1be', [-1.12 + i * 0.25, 0.33, 0], 0.005))
        for (const x of [-1.1, 1.1]) {
          const roller = cylinder(group, 0.16, 0.9, '#d8b76c', [x, 0.19, 0])
          roller.rotation.x = Math.PI / 2
        }
        parts.set(spec.id, strips)
        break
      }
      case 'trap': {
        box(group, [1.6, 0.07, 1.4], '#d9bd77', [0, 0, 0], 0.06)
        const hole = new THREE.Mesh(new THREE.CircleGeometry(0.63, 32), material('#283c3b'))
        hole.rotation.x = -Math.PI / 2
        hole.position.y = 0.047
        group.add(hole)
        const lid = box(group, [1.15, 0.06, 1.05], '#8fa5a0', [0, 0.08, 0], 0.04)
        textPlane(lid, '！', 0.4, 0.4, [0, 0.04, 0]).rotation.x = -Math.PI / 2
        parts.set(spec.id, [lid])
        break
      }
      case 'syrup': {
        cylinder(group, 0.24, 0.6, '#bb8a52', [0, 0.35, 0])
        cylinder(group, 0.2, 0.12, '#d6ac6b', [0, 0.72, 0])
        textPlane(group, '蜜', 0.32, 0.25, [0, 0.35, 0.25], '#fff1cb')
        const puddle = ball(group, 0.9, '#dcae60', [0, 0.02, 0], [1.3, 0.035, 1])
        puddle.material.transparent = true
        puddle.material.opacity = 0.65
        parts.set(spec.id, [puddle])
        break
      }
      case 'teacup': {
        cylinder(group, 0.75, 0.08, '#f8eddb', [0, 0.04, 0])
        const cup = new THREE.Group()
        group.add(cup)
        const ceramic = new THREE.Mesh(
          new THREE.CylinderGeometry(0.49, 0.38, 0.55, 32, 1, true),
          material('#f8e9d8', { side: THREE.DoubleSide })
        )
        ceramic.position.y = 0.39
        cup.add(ceramic)
        cylinder(cup, 0.46, 0.04, '#b68c65', [0, 0.49, 0])
        const handle = new THREE.Mesh(
          new THREE.TorusGeometry(0.22, 0.055, 8, 20),
          material('#f7dfd0')
        )
        handle.position.set(0.55, 0.4, 0)
        cup.add(handle)
        parts.set(spec.id, [cup])
        break
      }
      case 'popcorn': {
        box(group, [0.85, 1.1, 0.7], '#d59f99', [0, 0.55, 0], 0.1)
        box(group, [0.65, 0.5, 0.04], '#e5cd9d', [0, 0.72, 0.38], 0.03)
        textPlane(group, 'ぽん', 0.65, 0.25, [0, 0.25, 0.38], '#d59f99')
        const lid = box(group, [1, 0.15, 0.85], '#94b4b4', [0, 1.17, 0], 0.08)
        parts.set(spec.id, [lid])
        break
      }
      case 'balloon': {
        for (let i = 0; i < 3; i++) {
          ball(
            group,
            0.28,
            ['#dba69f', '#9ebfc5', '#e5c783'][i],
            [(i - 1) * 0.32, 1.4 + (i % 2) * 0.3, 0],
            [0.9, 1.2, 0.9]
          )
          cylinder(group, 0.012, 1.25, '#c5b99e', [(i - 1) * 0.32, 0.65, 0])
        }
        cylinder(group, 0.32, 0.12, '#b49577', [0, 0.06, 0])
        break
      }
      case 'ufo': {
        const saucer = new THREE.Group()
        saucer.position.y = 2.15
        group.add(saucer)
        ball(saucer, 0.7, '#a1bbc0', [0, 0, 0], [1.4, 0.22, 1.4])
        ball(saucer, 0.4, '#c3d7ce', [0, 0.15, 0], [1, 0.6, 1])
        for (let i = 0; i < 8; i++)
          ball(saucer, 0.07, '#e4cc83', [
            Math.cos((i * Math.PI) / 4) * 0.8,
            0,
            Math.sin((i * Math.PI) / 4) * 0.8,
          ])
        const beam = new THREE.Mesh(
          new THREE.ConeGeometry(0.9, 2, 24, 1, true),
          material('#cfdb9a', {
            transparent: true,
            opacity: 0.17,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        )
        beam.position.y = 1
        group.add(beam)
        parts.set(spec.id, [saucer, beam])
        break
      }
      case 'portal': {
        const rings: THREE.Object3D[] = []
        for (const offset of [0, 5]) {
          const gate = new THREE.Mesh(
            new THREE.TorusGeometry(0.65, 0.1, 12, 36),
            material(offset ? '#e1b9a7' : '#9dcee0', {
              emissive: offset ? '#a66b55' : '#417b94',
              emissiveIntensity: 0.3,
            })
          )
          gate.position.set(offset, 0.85, 0)
          group.add(gate)
          rings.push(gate)
          cylinder(group, 0.76, 0.09, '#748d9e', [offset, 0.06, 0])
        }
        parts.set(spec.id, rings)
        break
      }
      case 'reverse': {
        cylinder(group, 0.34, 0.13, '#b1bfce', [0, 0.08, 0])
        const orb = ball(group, 0.35, '#d5c6d7', [0, 0.8, 0])
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.55, 0.045, 8, 32),
          material('#dacb95')
        )
        ring.position.y = 0.8
        ring.rotation.x = 0.7
        group.add(ring)
        parts.set(spec.id, [orb, ring])
        break
      }
      case 'meteor': {
        cylinder(group, 0.25, 0.1, '#b4beca', [0, 0.05, 0])
        cylinder(group, 0.025, 1.5, '#c7b796', [0, 0.8, 0])
        const mobile = new THREE.Group()
        mobile.position.y = 1.65
        group.add(mobile)
        for (let i = 0; i < 3; i++) {
          const star = new THREE.Mesh(makeStarGeometry(0.19), material('#e8c582'))
          star.position.set((i - 1) * 0.4, -Math.abs(i - 1) * 0.3, 0)
          mobile.add(star)
        }
        parts.set(spec.id, [mobile])
        break
      }
    }
  }
  if (theme === 'factory') {
    for (const x of [-5, 0, 5]) {
      box(world.world, [0.5, 1.7, 0.5], '#6e8c89', [x, 0.85, -3.5])
      cylinder(world.world, 0.38, 0.12, '#dfb56f', [x, 1.76, -3.5])
    }
    const sign = box(world.world, [3.5, 0.65, 0.12], '#ebce85', [0, 2.1, -3.5], 0.05)
    textPlane(sign, 'もちもち安全第一', 3.2, 0.5, [0, 0, 0.07], '#ebce85', '#536b68')
  } else if (theme === 'cafe') {
    for (const x of [-5, 5]) cylinder(world.world, 0.055, 2.5, '#be9587', [x, 1.3, -3.45])
    for (let i = 0; i < 12; i++)
      box(
        world.world,
        [0.85, 0.12, 1.15],
        i % 2 ? '#f7e8d6' : '#d9aaa5',
        [-4.68 + i * 0.85, 2.5, -3.1],
        0.03
      )
    textPlane(world.world, '喫茶 もち', 3.3, 0.75, [0, 1.95, -3.2], '#f7e8d6', '#94705f')
    for (const x of [-4.8, 4.8]) {
      cylinder(world.world, 0.4, 0.15, '#edcfb7', [x, 0.6, 2.9])
      cylinder(world.world, 0.07, 0.5, '#bd9c87', [x, 0.28, 2.9])
    }
  } else if (theme === 'moon') {
    const planet = ball(world.world, 0.65, '#cab6b9', [-4.8, 2.3, -3.3])
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 8, 48), material('#eed08c'))
    ring.position.copy(planet.position)
    ring.rotation.x = 1.1
    world.world.add(ring)
    ball(world.world, 0.45, '#9cb6c5', [4.9, 2.1, -3.3])
    for (let i = 0; i < 12; i++) {
      const star = new THREE.Mesh(
        makeStarGeometry(0.08 + (i % 3) * 0.025),
        material('#f0d9a3', { emissive: '#c6b77e', emissiveIntensity: 0.3 })
      )
      star.position.set(-5.2 + i * 0.9, 1.7 + Math.sin(i * 2.3) * 0.6, -3.7)
      world.world.add(star)
    }
  }
  return { props, parts, targets: [...props.values()] }
}
