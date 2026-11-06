import * as THREE from 'three'
import rareImage from '@/assets/C3supiki.png'
import supikiImage from '@/assets/supiki.png'
import type { PlaygroundSound } from './sound'
import { decorateTheme, disposeObject } from './themeProps'
import {
  type Discovery,
  type Gimmick,
  type SceneCallbacks,
  type ThemeId,
  type ToyAction,
  themeById,
  themes,
} from './types'
import { canvasTexture, createWorld, makeStarGeometry, material } from './world'

type Resident = {
  id: number
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  position: THREE.Vector3
  velocity: THREE.Vector3
  size: number
  squish: number
  nextMove: number
  happyUntil: number
  flatUntil: number
  frozenUntil: number
  balloonUntil: number
  teleportAfter: number
  balloon: THREE.Group | null
}

type Treat = {
  id: number
  mesh: THREE.Group
  position: THREE.Vector3
  born: number
  decoy: boolean
  falling: boolean
}
type Particle = {
  mesh: THREE.Mesh | THREE.Sprite
  velocity: THREE.Vector3
  life: number
  age: number
  speech: boolean
}
type Drag = {
  pointer: number
  resident: Resident | null
  treat: Treat | null
  action: ToyAction | null
  start: THREE.Vector2
  last: THREE.Vector2
  previous: THREE.Vector3
  time: number
  moved: boolean
}

const MAX_RESIDENTS = 20
const FLOOR = 0.07
const RADIUS = 0.35
const STAGE_PIVOT_DISTANCE = 64
const STAGE_TRANSITION_SECONDS = 1.2
const phrases = ['ﾁｮﾜﾖ〜', 'ｴｰｳ', 'もちっ', 'ｽﾋﾟｷ！', '……？', 'ﾁｮﾜﾖ！']
const palette = ['#ecbe72', '#e4a6a3', '#9ebdc2', '#adc38d', '#f3d7a8']
const clamp = THREE.MathUtils.clamp

export class PlaygroundScene {
  private mount: HTMLDivElement
  private sound: PlaygroundSound
  private callbacks: SceneCallbacks
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-9, 9, 6, -6, 0.1, 100)
  private world: ReturnType<typeof createWorld>
  private decor: ReturnType<typeof decorateTheme>
  private stagePivot = new THREE.Group()
  private stageContent = new THREE.Group()
  private theme: ThemeId = 'garden'
  private transition: {
    next: ThemeId
    direction: number
    progress: number
    swapped: boolean
    angle: number
  } | null = null
  private activeGimmicks = new Set<Gimmick>()
  private gimmickUntil = new Map<Gimmick, number>()
  private nextRain = 0
  private placingCandy = false
  private candyPreview: THREE.Group | null = null
  private floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR)
  private ambient = new THREE.HemisphereLight('#fff5df', '#bac1a0', 2.8)
  private sun = new THREE.DirectionalLight('#fff0d6', 3)
  private nightLight = new THREE.PointLight('#ffc77a', 0, 18, 1.5)
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private dragPlane = new THREE.Plane()
  private scratch = new THREE.Vector3()
  private relativeVelocity = new THREE.Vector3()
  private nightGroundColor = new THREE.Color('#34474d')
  private drag: Drag | null = null
  private residents: Resident[] = []
  private treats: Treat[] = []
  private particles: Particle[] = []
  private textures: THREE.Texture[] = []
  private characterGeometry = new THREE.PlaneGeometry(1, 1)
  private shadowGeometry = new THREE.PlaneGeometry(1, 1)
  private starGeometry = makeStarGeometry(0.09)
  private waterGeometry = new THREE.SphereGeometry(0.05, 6, 4)
  private waterMaterial = new THREE.MeshBasicMaterial({
    color: '#94c5df',
    transparent: true,
    opacity: 0.8,
  })
  private particleMaterials = palette.map((color) => material(color))
  private speechTextures = new Map<string, THREE.CanvasTexture>()
  private shadowTexture: THREE.CanvasTexture
  private resizeObserver: ResizeObserver
  private labels: { element: HTMLElement; point: THREE.Vector3 }[] = []
  private id = 0
  private ready = false
  private disposed = false
  private paused = false
  private floating = false
  private radio = false
  private night = false
  private nightAmount = 0
  private found = new Set<Discovery>()
  private lastTime = 0
  private elapsed = 0
  private accumulator = 0
  private trampolinePulse = 0
  private azimuth = 0.28
  private desiredAzimuth = 0.28
  private elevation = 0.76
  private desiredElevation = 0.76
  private zoom = 1
  private desiredZoom = 1
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  constructor(
    mount: HTMLDivElement,
    sound: PlaygroundSound,
    callbacks: SceneCallbacks,
    initial: { night: boolean; discoveries: Discovery[]; theme?: ThemeId }
  ) {
    this.mount = mount
    this.sound = sound
    this.callbacks = callbacks
    this.night = initial.night
    this.nightAmount = initial.night ? 1 : 0
    this.found = new Set(initial.discoveries)
    this.theme = initial.theme ?? 'garden'
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.12
    this.renderer.setClearColor('#f5eddf', 0)
    const canvas = this.renderer.domElement
    canvas.setAttribute(
      'aria-label',
      'スピキの3Dあそびば。スピキをドラッグして投げたり、空いている場所をドラッグして視点を回せます。'
    )
    canvas.setAttribute('aria-describedby', 'playground-keyboard-help')
    canvas.tabIndex = 0
    mount.appendChild(canvas)

    this.scene.add(this.ambient)
    this.sun.position.set(-5, 12, 6)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(1024, 1024)
    this.sun.shadow.camera.left = -10
    this.sun.shadow.camera.right = 10
    this.sun.shadow.camera.top = 10
    this.sun.shadow.camera.bottom = -10
    this.sun.shadow.normalBias = 0.04
    this.sun.shadow.bias = -0.0001
    this.sun.shadow.radius = 3
    this.scene.add(this.sun)
    this.nightLight.position.set(0, 3, -1.5)
    this.scene.add(this.nightLight)
    this.world = createWorld(this.scene, this.theme)
    this.decor = decorateTheme(this.world, this.theme)
    this.positionStagePivot()
    this.stagePivot.add(this.stageContent)
    this.stageContent.add(this.world.world)
    this.scene.add(this.stagePivot)
    this.shadowTexture = canvasTexture(128, 128, (ctx) => {
      const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62)
      gradient.addColorStop(0, '#55483a70')
      gradient.addColorStop(0.45, '#55483a30')
      gradient.addColorStop(1, '#55483a00')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 128, 128)
    })

    const positions: Record<string, [number, number, number]> = {
      jump: [-3.65, 0.35, 2.0],
      radio: [3.7, 2.25, -2.3],
      float: [0.5, 1.65, -2.8],
      snack: [3.3, 0.15, 2.9],
    }
    for (const skin of themes)
      for (const gimmick of skin.gimmicks)
        positions[gimmick.id] = [gimmick.position[0], 1.8, gimmick.position[1]]
    const overlay = mount.parentElement
    overlay?.querySelectorAll<HTMLElement>('[data-toy]').forEach((element) => {
      const point = positions[element.dataset.toy ?? '']
      if (point) this.labels.push({ element, point: new THREE.Vector3(...point) })
    })

    this.resizeObserver = new ResizeObserver(this.resize)
    this.resizeObserver.observe(mount)
    canvas.addEventListener('pointerdown', this.pointerDown)
    canvas.addEventListener('pointermove', this.pointerMove)
    canvas.addEventListener('pointerup', this.pointerUp)
    canvas.addEventListener('pointercancel', this.pointerCancel)
    canvas.addEventListener('lostpointercapture', this.pointerCancel)
    canvas.addEventListener('wheel', this.wheel, { passive: false })
    canvas.addEventListener('keydown', this.keyDown)
    canvas.addEventListener('webglcontextlost', this.contextLost)
    document.addEventListener('visibilitychange', this.visibilityChanged)
    this.resize()
    this.renderer.setAnimationLoop(this.animate)

    const loader = new THREE.TextureLoader()
    void Promise.allSettled([loader.loadAsync(supikiImage), loader.loadAsync(rareImage)])
      .then((results) => {
        const loaded = results.flatMap((result) =>
          result.status === 'fulfilled' ? [result.value] : []
        )
        if (this.disposed) {
          for (const texture of loaded) texture.dispose()
          return
        }
        if (results[0].status === 'rejected') {
          for (const texture of loaded) texture.dispose()
          this.callbacks.onError('スピキの画像を読み込めませんでした。')
          return
        }
        for (const texture of loaded) {
          texture.colorSpace = THREE.SRGBColorSpace
          texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy())
        }
        this.textures = [
          results[0].value,
          results[1].status === 'fulfilled' ? results[1].value : results[0].value,
        ]
        this.ready = true
        this.populate()
        this.callbacks.onReady()
      })
      .catch(() => {
        if (!this.disposed) this.callbacks.onError('スピキの画像を読み込めませんでした。')
      })
  }

  private resize = () => {
    if (this.disposed) return
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight
    if (!width || !height) return
    this.renderer.setSize(width, height)
    const visibleWidth = width < 600 ? 14.5 : 17.5
    const visibleHeight = (visibleWidth * height) / width
    this.camera.left = -visibleWidth / 2
    this.camera.right = visibleWidth / 2
    this.camera.top = visibleHeight / 2
    this.camera.bottom = -visibleHeight / 2
    this.camera.updateProjectionMatrix()
    this.updateCamera(1)
  }

  private populate() {
    const positions: [number, number, number][] = [
      [-0.55, 1.5, 0.55],
      [1.15, 2.3, 0.8],
      [-1.8, 2.8, -1.6],
      [0.6, 3.4, 2.3],
    ]
    for (const position of positions) this.addResident(new THREE.Vector3(...position), false)
    this.emitState()
  }

  private addResident(position?: THREE.Vector3, special = false) {
    if (this.residents.length >= MAX_RESIDENTS) {
      this.callbacks.onMessage('そろそろ、ぎゅうぎゅうです。')
      return
    }
    const rare = special || (this.residents.length > 4 && Math.random() < 0.06)
    const mesh = new THREE.Mesh(
      this.characterGeometry,
      new THREE.MeshBasicMaterial({
        map: this.textures[rare ? 1 : 0],
        transparent: true,
        alphaTest: 0.08,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
    )
    const size = this.residents.length === 0 ? 1.12 : rare ? 1.05 : 0.9 + Math.random() * 0.17
    const resident: Resident = {
      id: this.id++,
      mesh,
      shadow: new THREE.Mesh(
        this.shadowGeometry,
        new THREE.MeshBasicMaterial({
          map: this.shadowTexture,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        })
      ),
      position:
        position ?? new THREE.Vector3((Math.random() - 0.5) * 4, 3.5, (Math.random() - 0.5) * 3),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.8, 0, 0),
      size,
      squish: 0,
      nextMove: this.elapsed + 1 + Math.random() * 4,
      happyUntil: 0,
      flatUntil: 0,
      frozenUntil: 0,
      balloonUntil: 0,
      teleportAfter: 0,
      balloon: null,
    }
    mesh.userData.resident = resident.id
    mesh.castShadow = true
    resident.shadow.rotation.x = -Math.PI / 2
    resident.shadow.position.y = FLOOR + 0.005
    this.stageContent.add(mesh, resident.shadow)
    this.residents.push(resident)
    return resident
  }

  act(action: ToyAction) {
    if (!this.ready || this.disposed || this.transition) return
    this.sound.unlock()
    switch (action) {
      case 'add': {
        const resident = this.addResident()
        if (resident) {
          this.sound.pop()
          this.say(resident, this.residents.length === 10 ? '……せまい？' : 'ｽﾋﾟｷ！')
          this.callbacks.onMessage(
            this.residents.length >= 12 ? 'ここが、もちもちの限界……？' : 'またひとり、よりみち。'
          )
        }
        break
      }
      case 'snack':
        this.placingCandy = !this.placingCandy
        if (!this.placingCandy) this.cancelCandyPreview()
        this.callbacks.onMessage(
          this.placingCandy
            ? 'あめを置きたい場所をタップ。ドラッグで運んでも、どうぞ。'
            : 'おやつは、またあとで。'
        )
        break
      case 'jump':
        for (const resident of this.residents) {
          if (this.drag?.resident === resident) continue
          resident.velocity.y = 7 + Math.random() * 2.5
          resident.velocity.x += (Math.random() - 0.5) * 2
          resident.squish = 0.3
        }
        this.trampolinePulse = 1
        this.sound.voice(1.1, true)
        this.sound.note(79, 0.25)
        this.burst(new THREE.Vector3(0, 1.7, 0), 14)
        this.callbacks.onMessage('せーの、もちっ！')
        break
      case 'float':
        this.floating = !this.floating
        if (this.floating) {
          for (const resident of this.residents) resident.velocity.y = 3 + Math.random() * 3
          this.discover('float')
          this.sound.note(88, 0.6, 0.04)
          this.callbacks.onMessage('重力も、ちょっとひとやすみ。')
        } else this.callbacks.onMessage('ただいま、地球。')
        break
      case 'radio':
        this.radio = !this.radio
        this.sound.setMusic(this.radio)
        if (this.radio) {
          this.discover('party')
          this.say(this.residents[0], 'ﾁｮﾜﾖ〜')
        }
        this.callbacks.onMessage(
          this.radio ? 'ただいま放送中、ﾁｮﾜﾖ FM。' : 'ラジオも、ひとやすみ。'
        )
        break
      case 'reset':
        this.clearResidents()
        this.clearTreats()
        this.floating = false
        this.placingCandy = false
        this.cancelCandyPreview()
        this.activeGimmicks.clear()
        this.gimmickUntil.clear()
        this.radio = false
        this.sound.setMusic(false)
        this.desiredAzimuth = 0.28
        this.desiredElevation = 0.76
        this.desiredZoom = 1
        this.populate()
        this.callbacks.onMessage('おかたづけ、できました。')
        break
      default:
        this.triggerGimmick(action)
    }
    this.emitState()
  }

  setNight(night: boolean) {
    this.night = night
    this.emitState()
  }

  setPaused(paused: boolean) {
    this.paused = paused
    this.lastTime = 0
    if (paused) {
      this.cancelDrag()
      this.sound.suspend()
    } else this.sound.resume()
  }

  private emitState() {
    this.callbacks.onState({
      count: this.residents.length,
      floating: this.floating,
      radio: this.radio,
      night: this.night,
      discoveries: [...this.found],
      theme: this.theme,
      changing: this.transition !== null,
      placingCandy: this.placingCandy,
      activeGimmicks: [...this.activeGimmicks],
    })
  }

  private discover(discovery: Discovery) {
    if (this.found.has(discovery)) return
    this.found.add(discovery)
    this.emitState()
  }

  private setPointer(event: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    this.raycaster.setFromCamera(this.pointer, this.camera)
  }

  private pick() {
    const targets: THREE.Object3D[] = [
      ...this.residents.map((resident) => resident.mesh),
      ...this.treats.map((treat) => treat.mesh),
      ...this.world.targets.filter((target) => target.visible),
      ...this.decor.targets,
    ]
    const hit = this.raycaster.intersectObjects(targets, true)[0]
    if (!hit) return { resident: null, treat: null, action: null }
    const resident = this.residents.find((item) => item.id === hit.object.userData.resident) ?? null
    let object: THREE.Object3D | null = hit.object
    let action: ToyAction | null = null
    let treat: Treat | null = null
    while (object && !action) {
      if (object.userData.treat !== undefined)
        treat = this.treats.find((entry) => entry.id === object?.userData.treat) ?? null
      action = object.userData.action ?? null
      object = object.parent
    }
    return { resident, treat, action }
  }

  private pointerDown = (event: PointerEvent) => {
    if (!this.ready || this.paused || this.drag || this.transition || event.button !== 0) return
    this.sound.unlock()
    this.setPointer(event)
    if (this.placingCandy) {
      this.commitCandyAt(event.clientX, event.clientY)
      return
    }
    const { resident, treat, action } = this.pick()
    this.drag = {
      pointer: event.pointerId,
      resident,
      treat,
      action,
      start: new THREE.Vector2(event.clientX, event.clientY),
      last: new THREE.Vector2(event.clientX, event.clientY),
      previous: resident?.position.clone() ?? new THREE.Vector3(),
      time: performance.now(),
      moved: false,
    }
    this.renderer.domElement.setPointerCapture(event.pointerId)
    this.renderer.domElement.focus({ preventScroll: true })
    if (resident) {
      this.dragPlane.setFromNormalAndCoplanarPoint(
        this.camera.getWorldDirection(new THREE.Vector3()),
        resident.position
      )
      resident.velocity.set(0, 0, 0)
      resident.squish = -0.12
      this.renderer.domElement.style.cursor = 'grabbing'
    }
  }

  private pointerMove = (event: PointerEvent) => {
    if (!this.ready || this.paused || this.transition) return
    this.setPointer(event)
    if (this.placingCandy && !this.drag) {
      this.previewCandyAt(event.clientX, event.clientY)
      this.renderer.domElement.style.cursor = 'copy'
      return
    }
    const drag = this.drag
    if (!drag) {
      const hit = this.pick()
      this.renderer.domElement.style.cursor =
        hit.resident || hit.treat ? 'grab' : hit.action ? 'pointer' : 'default'
      return
    }
    if (event.pointerId !== drag.pointer) return
    const dx = event.clientX - drag.last.x
    const dy = event.clientY - drag.last.y
    if (Math.hypot(event.clientX - drag.start.x, event.clientY - drag.start.y) > 5)
      drag.moved = true
    if (drag.treat) {
      const point = this.floorPoint(event.clientX, event.clientY)
      if (point) {
        drag.treat.position.copy(point)
        drag.treat.position.y = 0.25
        drag.treat.mesh.position.copy(drag.treat.position)
        drag.treat.born = this.elapsed
      }
    } else if (drag.resident && drag.moved) {
      const point = this.raycaster.ray.intersectPlane(this.dragPlane, this.scratch)
      if (point) {
        point.x = clamp(point.x, -5.35, 5.35)
        point.y = clamp(point.y + 0.15, 0.55, 6)
        point.z = clamp(point.z, -3.45, 3.45)
        const now = performance.now()
        const dt = clamp((now - drag.time) / 1000, 0.016, 0.08)
        drag.resident.velocity.copy(point).sub(drag.previous).divideScalar(dt).clampLength(0, 17)
        drag.resident.position.copy(point)
        drag.previous.copy(point)
        drag.time = now
      }
    } else if (!drag.resident && drag.moved) {
      this.desiredAzimuth -= dx * 0.004
      this.desiredElevation = clamp(this.desiredElevation + dy * 0.003, 0.45, 1.15)
    }
    drag.last.set(event.clientX, event.clientY)
  }

  private pointerUp = (event: PointerEvent) => {
    const drag = this.drag
    if (!drag || event.pointerId !== drag.pointer) return
    const resident = drag.resident
    if (resident) {
      if (drag.moved) {
        resident.velocity.y = clamp(resident.velocity.y + 2.5, 1.8, 13)
        this.discover('air')
        this.callbacks.onMessage('あっ。')
        this.say(resident, 'ｴｰｳ')
      } else {
        resident.velocity.y = 4
        resident.squish = 0.4
        this.discover('hello')
        this.say(resident, phrases[(resident.id + Math.floor(this.elapsed)) % phrases.length])
        this.callbacks.onMessage('さわると、だいたいよろこびます。')
      }
      this.sound.voice(0.95 + Math.random() * 0.2, true)
      this.burst(resident.position, 7)
    } else if (drag.treat) {
      drag.treat.born = this.elapsed
      this.callbacks.onMessage('ここに、置いときます。')
    } else if (drag.action && !drag.moved) this.act(drag.action)
    this.cancelDrag()
  }

  private cancelDrag() {
    const pointer = this.drag?.pointer
    this.drag = null
    const canvas = this.renderer.domElement
    if (pointer !== undefined && canvas.hasPointerCapture(pointer))
      canvas.releasePointerCapture(pointer)
    canvas.style.cursor = 'default'
  }

  private pointerCancel = () => this.cancelDrag()

  private wheel = (event: WheelEvent) => {
    if (this.paused) return
    event.preventDefault()
    this.desiredZoom = clamp(this.desiredZoom - event.deltaY * 0.0007, 0.8, 1.5)
  }

  private keyDown = (event: KeyboardEvent) => {
    if (this.paused || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return
    const keys: Record<string, ToyAction> = {
      '1': 'add',
      '2': 'snack',
      '3': 'jump',
      '4': 'float',
      m: 'radio',
      M: 'radio',
      ' ': 'jump',
    }
    if (keys[event.key]) {
      event.preventDefault()
      this.act(keys[event.key])
    } else if (event.key === 'Escape') {
      this.placingCandy = false
      this.cancelCandyPreview()
      this.emitState()
    } else if (event.key === 'Enter' && this.placingCandy) {
      this.createTreat(new THREE.Vector3(0, 0.25, 0))
      this.placingCandy = false
      this.cancelCandyPreview()
      this.emitState()
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      if (event.shiftKey) this.desiredAzimuth += event.key === 'ArrowLeft' ? 0.16 : -0.16
      else this.cycleTheme(event.key === 'ArrowLeft' ? -1 : 1)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      this.desiredElevation = clamp(
        this.desiredElevation + (event.key === 'ArrowUp' ? 0.1 : -0.1),
        0.45,
        1.15
      )
    }
  }

  private visibilityChanged = () => {
    this.lastTime = 0
    this.cancelDrag()
    if (document.hidden) this.sound.suspend()
    else if (!this.paused) this.sound.resume()
  }

  private contextLost = (event: Event) => {
    event.preventDefault()
    this.callbacks.onError('3D表示がひとやすみ中です。もう一度ひらいてみてください。')
  }

  private positionStagePivot() {
    // A distant, viewer-facing pivot makes the tray follow a shallow sideways arc.
    this.stagePivot.position.set(
      Math.sin(this.azimuth) * STAGE_PIVOT_DISTANCE,
      0,
      Math.cos(this.azimuth) * STAGE_PIVOT_DISTANCE
    )
    this.stageContent.position.copy(this.stagePivot.position).negate()
  }

  cycleTheme(direction: number) {
    const index = themes.findIndex((entry) => entry.id === this.theme)
    this.changeTheme(themes[(index + direction + themes.length) % themes.length].id, direction)
  }

  changeTheme(next: ThemeId, direction = 1) {
    if (!this.ready || this.transition || next === this.theme) return
    this.cancelDrag()
    this.cancelCandyPreview()
    this.placingCandy = false
    this.desiredAzimuth = this.azimuth
    this.desiredElevation = this.elevation
    this.desiredZoom = this.zoom
    this.positionStagePivot()
    const exitDistance =
      (Math.max(17.5, this.camera.right - this.camera.left) / this.zoom) * 0.5 + 8.5
    this.transition = {
      next,
      direction,
      progress: 0,
      swapped: false,
      angle: Math.asin(Math.min(0.6, exitDistance / STAGE_PIVOT_DISTANCE)),
    }
    this.callbacks.onMessage('手前を軸に、すーっと。おひっこしです。')
    this.sound.note(76, 0.25, 0.035)
    this.emitState()
  }

  private updateTransition(dt: number) {
    const transition = this.transition
    if (!transition) return
    // This user-triggered slide is part of the requested interaction, even in reduced-motion mode.
    transition.progress = Math.min(1, transition.progress + dt / STAGE_TRANSITION_SECONDS)
    const p = transition.progress
    if (p >= 0.5 && !transition.swapped) {
      transition.swapped = true
      this.clearTreats()
      for (const particle of this.particles) {
        particle.mesh.removeFromParent()
        if (particle.mesh instanceof THREE.Sprite) particle.mesh.material.dispose()
      }
      this.particles = []
      disposeObject(this.world.world)
      disposeObject(this.world.ground)
      this.theme = transition.next
      this.world = createWorld(this.scene, this.theme)
      this.decor = decorateTheme(this.world, this.theme)
      this.stageContent.add(this.world.world)
      this.activeGimmicks.clear()
      this.gimmickUntil.clear()
      this.floating = false
      for (const resident of this.residents) {
        resident.flatUntil = 0
        resident.frozenUntil = 0
        resident.balloonUntil = 0
        resident.position.y = Math.max(resident.position.y, 0.5)
      }
      this.emitState()
    }
    const half = p < 0.5 ? p * 2 : (p - 0.5) * 2
    const eased = half * half * (3 - 2 * half)
    // Swap outside the viewport, then bring the next tray in from the opposite side.
    this.stagePivot.rotation.y =
      transition.direction * (p < 0.5 ? eased : -(1 - eased)) * transition.angle
    if (p === 1) {
      this.stagePivot.rotation.y = 0
      this.stageContent.scale.setScalar(1)
      this.transition = null
      this.callbacks.onMessage(themeById(this.theme).note)
      this.emitState()
    }
  }

  private candyMesh(decoy = false) {
    const mesh = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 8),
      material(decoy ? '#beacd0' : '#e8b86d')
    )
    body.scale.set(1.3, 0.85, 1)
    body.castShadow = true
    mesh.add(body)
    for (const direction of [-1, 1]) {
      const wrapper = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.17, 4), material('#f5d6a5'))
      wrapper.rotation.z = (direction * Math.PI) / 2
      wrapper.position.x = direction * 0.23
      mesh.add(wrapper)
    }
    return mesh
  }

  private createTreat(position: THREE.Vector3, decoy = false, falling = false) {
    if (this.treats.length >= 12) {
      this.callbacks.onMessage('あめは12こまで。いまあるあめも、つまんで運べます。')
      return false
    }
    const mesh = this.candyMesh(decoy)
    const id = this.id++
    mesh.userData.treat = id
    mesh.position.copy(position)
    this.stageContent.add(mesh)
    this.treats.push({ id, mesh, position: position.clone(), born: this.elapsed, decoy, falling })
    this.sound.pop()
    return true
  }

  private floorPoint(x: number, y: number) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null
    this.pointer.set(
      ((x - rect.left) / rect.width) * 2 - 1,
      -((y - rect.top) / rect.height) * 2 + 1
    )
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const point = this.raycaster.ray.intersectPlane(this.floorPlane, new THREE.Vector3())
    return point && Math.abs(point.x) <= 5.5 && Math.abs(point.z) <= 3.6 ? point : null
  }

  previewCandyAt(x: number, y: number) {
    if (!this.ready || this.transition || this.paused) return
    this.sound.unlock()
    const point = this.floorPoint(x, y)
    this.candyPreview ??= this.candyMesh()
    if (!this.candyPreview.parent) this.stageContent.add(this.candyPreview)
    this.candyPreview.visible = point !== null
    if (point) {
      this.candyPreview.position.copy(point)
      this.candyPreview.position.y = 0.42
    }
  }

  commitCandyAt(x: number, y: number) {
    if (!this.ready || this.transition || this.paused) return
    const point = this.floorPoint(x, y)
    if (point) {
      point.y = 0.25
      if (this.createTreat(point)) {
        this.placingCandy = false
        this.callbacks.onMessage('ここに、置いときます。あめは後から動かしても、どうぞ。')
      }
    }
    this.cancelCandyPreview()
    this.emitState()
  }

  cancelCandyPreview() {
    if (this.candyPreview) disposeObject(this.candyPreview)
    this.candyPreview = null
  }

  private triggerGimmick(action: Gimmick) {
    const spec = themeById(this.theme).gimmicks.find((entry) => entry.id === action)
    if (!spec) return
    if (spec.toggle && this.activeGimmicks.has(action)) {
      this.activeGimmicks.delete(action)
      this.callbacks.onMessage(`${spec.label}、おしまい。`)
      return
    }
    this.activeGimmicks.add(action)
    if (!spec.toggle) this.gimmickUntil.set(action, this.elapsed + (action === 'balloon' ? 10 : 3))
    this.callbacks.onMessage(spec.hint)
    this.sound.note(65 + Math.floor(Math.random() * 16), 0.25, 0.045)
    if (action === 'bait')
      this.createTreat(new THREE.Vector3(spec.position[0], 0.25, spec.position[1] + 0.7), true)
    if (action === 'popcorn') {
      for (let i = 0; i < 6; i++)
        this.createTreat(
          new THREE.Vector3((Math.random() - 0.5) * 7, 0.25, (Math.random() - 0.5) * 5),
          false,
          true
        )
    }
    for (const resident of this.residents) {
      if (action === 'hammer') {
        resident.flatUntil = this.elapsed + 4
        resident.velocity.y = 1.3
        this.say(resident, 'ぺたん')
      }
      if (action === 'wind') {
        resident.velocity.x += 6
        resident.velocity.y += 3
      }
      if (action === 'bell') {
        resident.frozenUntil = this.elapsed + 3
        resident.velocity.set(0, 0, 0)
        this.say(resident, 'ピタッ')
      }
      if (action === 'balloon') {
        resident.balloonUntil = this.elapsed + 10
        resident.velocity.y = 4
        if (!resident.balloon) {
          const balloon = new THREE.Group()
          const globe = new THREE.Mesh(
            new THREE.SphereGeometry(0.26, 12, 10),
            material(palette[resident.id % palette.length])
          )
          globe.position.y = 1.6
          globe.scale.y = 1.2
          balloon.add(globe)
          const string = new THREE.Mesh(
            new THREE.CylinderGeometry(0.009, 0.009, 1.4, 5),
            material('#a39881')
          )
          string.position.y = 0.75
          balloon.add(string)
          resident.balloon = balloon
          this.stageContent.add(balloon)
        }
      }
      if (action === 'sprinkler') {
        resident.velocity.y = 3
        this.say(resident, 'つめたっ')
      }
    }
    if (['hammer', 'wind', 'sprinkler', 'reverse', 'ufo'].includes(action))
      this.sound.voice(action === 'hammer' ? 0.83 : 1.1, true)
  }

  private updateGimmicks(dt: number) {
    let changed = false
    for (const [id, until] of this.gimmickUntil) {
      if (this.elapsed > until) {
        this.activeGimmicks.delete(id)
        this.gimmickUntil.delete(id)
        changed = true
      }
    }
    if (changed) this.emitState()
    const active = (id: Gimmick) => this.activeGimmicks.has(id)
    for (const [id, parts] of this.decor.parts) {
      if (id === 'wind' || id === 'fan') parts[0].rotation.z += dt * (active(id) ? 22 : 1)
      if (id === 'sprinkler') parts[0].rotation.y += dt * (active(id) ? 10 : 0)
      if (id === 'bell') parts[0].rotation.z = active(id) ? Math.sin(this.elapsed * 19) * 0.4 : 0
      if (id === 'bait') parts[0].position.y = 0.75 + Math.sin(this.elapsed * 2) * 0.06
      if (id === 'hammer')
        parts[0].rotation.z = active(id) ? Math.sin(this.elapsed * 15) * 0.9 : -0.12
      if (id === 'conveyor' && active(id))
        parts.forEach((part, index) => {
          part.position.x = ((index * 0.25 + this.elapsed * 2) % 2.5) - 1.25
        })
      if (id === 'trap') parts[0].visible = !active(id)
      if (id === 'syrup') parts[0].visible = active(id)
      if (id === 'teacup') parts[0].rotation.y += active(id) ? dt * 5 : 0
      if (id === 'popcorn')
        parts[0].position.y = 1.17 + (active(id) ? Math.abs(Math.sin(this.elapsed * 12)) * 0.2 : 0)
      if (id === 'ufo') {
        parts[0].rotation.y += dt
        parts[1].visible = active(id)
      }
      if (id === 'portal') for (const ring of parts) ring.rotation.z += active(id) ? dt * 2 : 0
      if (id === 'reverse') {
        parts[1].rotation.z += dt * (active(id) ? 3 : 0.4)
        parts[0].position.y = 0.8 + Math.sin(this.elapsed * 3) * 0.06
      }
      if (id === 'meteor') parts[0].rotation.y += dt
    }
    if (this.elapsed > this.nextRain && (active('sprinkler') || active('meteor'))) {
      this.nextRain = this.elapsed + 0.22
      if (active('sprinkler')) {
        for (let i = 0; i < 8 && this.particles.length < 120; i++) {
          const mesh = new THREE.Mesh(this.waterGeometry, this.waterMaterial)
          mesh.position.set(4.9, 1, 0)
          this.stageContent.add(mesh)
          this.particles.push({
            mesh,
            velocity: new THREE.Vector3(
              -1 - Math.random() * 4,
              2 + Math.random() * 3,
              (Math.random() - 0.5) * 6
            ),
            life: 1.7,
            age: 0,
            speech: false,
          })
        }
      } else
        this.burst(new THREE.Vector3((Math.random() - 0.5) * 8, 4.5, (Math.random() - 0.5) * 5), 6)
      if (active('meteor'))
        for (const resident of this.residents) {
          resident.velocity.x += (Math.random() - 0.5) * 2
          resident.velocity.y += Math.random() * 1.8
        }
    }
  }

  private say(resident: Resident | undefined, text: string) {
    if (!resident || this.particles.filter((particle) => particle.speech).length >= 4) return
    let texture = this.speechTextures.get(text)
    if (!texture) {
      texture = canvasTexture(512, 160, (ctx) => {
        ctx.fillStyle = '#fff9ed'
        ctx.strokeStyle = '#736d60'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.roundRect(7, 6, 498, 124, 36)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(236, 128)
        ctx.lineTo(250, 153)
        ctx.lineTo(272, 128)
        ctx.fill()
        ctx.fillStyle = '#625548'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 64px "Hiragino Maru Gothic ProN", "Noto Sans CJK JP", sans-serif'
        ctx.fillText(text, 256, 71)
      })
      this.speechTextures.set(text, texture)
    }
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        toneMapped: false,
      })
    )
    sprite.position.copy(resident.position)
    sprite.position.y += 2.15
    sprite.scale.set(1.65, 0.52, 1)
    sprite.renderOrder = 10
    this.stageContent.add(sprite)
    this.particles.push({
      mesh: sprite,
      velocity: new THREE.Vector3(0, 0.35, 0),
      life: 1.7,
      age: 0,
      speech: true,
    })
  }

  private burst(position: THREE.Vector3, count: number) {
    for (let i = 0; i < count && this.particles.length < 120; i++) {
      const mesh = new THREE.Mesh(
        this.starGeometry,
        this.particleMaterials[i % this.particleMaterials.length]
      )
      mesh.position.copy(position).add(new THREE.Vector3(0, 0.5, 0))
      this.stageContent.add(mesh)
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          1.5 + Math.random() * 2.3,
          (Math.random() - 0.5) * 3
        ),
        life: 0.8 + Math.random() * 0.6,
        age: 0,
        speech: false,
      })
    }
  }

  private zoneDistance(resident: Resident, gimmick: Gimmick) {
    const spec = themeById(this.theme).gimmicks.find((entry) => entry.id === gimmick)
    return spec
      ? Math.hypot(resident.position.x - spec.position[0], resident.position.z - spec.position[1])
      : Infinity
  }

  private applyGimmickForces(resident: Resident, dt: number, grounded: boolean) {
    const active = this.activeGimmicks
    const { position, velocity } = resident
    if (active.has('conveyor') && grounded) velocity.x += dt * 7
    if (active.has('fan') && this.zoneDistance(resident, 'fan') < 3) {
      velocity.y += dt * 22
      velocity.x -= dt * 4
    }
    if (active.has('syrup') && this.zoneDistance(resident, 'syrup') < 1.5 && grounded) {
      velocity.x *= Math.exp(-dt * 18)
      velocity.z *= Math.exp(-dt * 18)
      resident.squish = Math.max(resident.squish, 0.2)
    }
    if (active.has('teacup') && grounded) {
      velocity.x = -(position.z + 0.6) * 2
      velocity.z = (position.x - 1.2) * 2
    }
    if (
      active.has('ufo') &&
      this.elapsed > resident.teleportAfter &&
      this.zoneDistance(resident, 'ufo') < 3
    ) {
      velocity.x += (1.2 - position.x) * dt * 3
      velocity.z += (-0.6 - position.z) * dt * 3
      velocity.y += dt * 22
      if (position.y > 3.2) {
        position.set((Math.random() - 0.5) * 7, 2, 2.5)
        resident.teleportAfter = this.elapsed + 3
        this.say(resident, 'どこ…？')
        this.burst(position, 9)
      }
    }
    if (
      active.has('portal') &&
      this.elapsed > resident.teleportAfter &&
      this.zoneDistance(resident, 'portal') < 0.85
    ) {
      position.set(3.3, 1.3, 2.5)
      velocity.set(0.5, 3, -1)
      resident.teleportAfter = this.elapsed + 2
      this.say(resident, 'あれ？')
      this.burst(position, 10)
      this.sound.pop()
    }
  }

  private updatePhysics(dt: number) {
    for (const resident of this.residents) {
      if (this.drag?.resident === resident || this.elapsed < resident.frozenUntil) continue
      const { position, velocity, size } = resident
      if (position.y < -2.5) {
        position.set((Math.random() - 0.5) * 5, 3, (Math.random() - 0.5) * 3)
        velocity.set(0, 0, 0)
        resident.teleportAfter = this.elapsed + 2
        this.say(resident, 'ただいま…')
        this.sound.voice(0.95)
      }
      const radius = RADIUS * size
      const ground = FLOOR + radius
      const grounded = position.y < ground + 0.12
      const treat = this.treats.find((entry) => !entry.falling || this.elapsed - entry.born > 0.8)
      if (treat && grounded) {
        const direction = this.scratch.copy(treat.position).sub(position)
        direction.y = 0
        if (direction.length() < 0.52 && this.drag?.treat !== treat) {
          this.removeTreat(treat)
          resident.velocity.y = 4.5
          resident.happyUntil = this.elapsed + 3
          if (!treat.decoy) this.discover('snack')
          else resident.frozenUntil = this.elapsed + 0.7
          this.say(resident, treat.decoy ? '……ない？' : 'ﾁｮﾜﾖ！')
          this.burst(position, 12)
          this.sound.voice(1.1)
          this.sound.note(88, 0.16)
          this.callbacks.onMessage(
            treat.decoy
              ? '食べようとしたら、すーっと消えました。'
              : 'あめは別腹。かぼちゃは観賞用。'
          )
        } else {
          direction.normalize().multiplyScalar(dt * 3.6)
          velocity.x += direction.x
          velocity.z += direction.z
        }
      } else if (grounded && this.elapsed > resident.nextMove && !this.reducedMotion) {
        resident.nextMove = this.elapsed + 2.5 + Math.random() * 5
        velocity.x += (Math.random() - 0.5) * 2
        velocity.z += (Math.random() - 0.5) * 1.5
        velocity.y = 1.8 + Math.random()
      }

      this.applyGimmickForces(resident, dt, grounded)
      const gravity =
        this.elapsed < resident.balloonUntil
          ? -0.6
          : this.activeGimmicks.has('reverse')
            ? -7
            : this.floating
              ? 2.1
              : this.theme === 'moon'
                ? 7
                : 14
      velocity.y -= gravity * dt
      const friction = Math.exp(-(grounded ? 3.6 : 0.25) * dt)
      velocity.x *= friction
      velocity.z *= friction
      position.addScaledVector(velocity, dt)
      if (this.activeGimmicks.has('reverse') && position.y > 4.7) {
        position.y = 4.7
        velocity.y = -Math.abs(velocity.y) * 0.4
      }
      if (this.elapsed < resident.balloonUntil && position.y > 3.8) {
        position.y = 3.8
        velocity.y = Math.min(velocity.y, 0)
      }
      if (position.y > 6.2) velocity.y = Math.min(velocity.y, -1)

      const onTrampoline = Math.hypot(position.x + 3.65, position.z - 0.65) < 0.88
      const overTrap =
        this.activeGimmicks.has('trap') &&
        this.elapsed > resident.teleportAfter &&
        this.zoneDistance(resident, 'trap') < 0.63
      const surface = overTrap ? -4 : ground + (onTrampoline ? 0.38 : 0)
      if (position.y < surface && velocity.y < 0) {
        position.y = surface
        if (onTrampoline) {
          velocity.y = this.floating ? 5 : 10
          velocity.x += (Math.random() - 0.5) * 1.1
          this.trampolinePulse = 1
          this.sound.pop()
        } else {
          const impact = -velocity.y
          velocity.y = impact > 2 ? impact * 0.48 : 0
          resident.squish = Math.min(0.48, impact * 0.035)
          if (impact > 5) this.sound.pop()
        }
      }
      if (Math.abs(position.x) > 5.5) {
        position.x = clamp(position.x, -5.5, 5.5)
        velocity.x *= -0.65
      }
      if (Math.abs(position.z) > 3.6) {
        position.z = clamp(position.z, -3.6, 3.6)
        velocity.z *= -0.65
      }
    }

    for (let a = 0; a < this.residents.length; a++) {
      for (let b = a + 1; b < this.residents.length; b++) {
        const first = this.residents[a]
        const second = this.residents[b]
        if (this.drag?.resident === first || this.drag?.resident === second) continue
        const difference = this.scratch.copy(second.position).sub(first.position)
        const distance = difference.length()
        const separation = RADIUS * (first.size + second.size)
        if (distance >= separation || distance < 0.001) continue
        difference.divideScalar(distance)
        const penetration = (separation - distance) * 0.5
        first.position.addScaledVector(difference, -penetration)
        second.position.addScaledVector(difference, penetration)
        const relative = this.relativeVelocity
          .copy(second.velocity)
          .sub(first.velocity)
          .dot(difference)
        if (relative < 0) {
          first.velocity.addScaledVector(difference, relative * 0.7)
          second.velocity.addScaledVector(difference, -relative * 0.7)
        }
      }
    }
  }

  private updateCamera(factor: number) {
    this.azimuth = THREE.MathUtils.lerp(this.azimuth, this.desiredAzimuth, factor)
    this.elevation = THREE.MathUtils.lerp(this.elevation, this.desiredElevation, factor)
    this.zoom = THREE.MathUtils.lerp(this.zoom, this.desiredZoom, factor)
    this.camera.position.set(
      Math.sin(this.azimuth) * Math.cos(this.elevation) * 22,
      Math.sin(this.elevation) * 22,
      Math.cos(this.azimuth) * Math.cos(this.elevation) * 22
    )
    this.camera.lookAt(0, 0.45, 0)
    this.camera.zoom = this.zoom
    this.camera.updateProjectionMatrix()
    this.camera.updateMatrixWorld()
  }

  private animate = (milliseconds: number) => {
    if (this.disposed || document.hidden || this.paused) {
      this.lastTime = 0
      return
    }
    const time = milliseconds / 1000
    const dt = this.lastTime ? Math.min(time - this.lastTime, 0.05) : 1 / 60
    this.lastTime = time
    this.elapsed += dt
    this.updateTransition(dt)
    this.accumulator += dt
    while (this.accumulator >= 1 / 60) {
      if (!this.transition) this.updatePhysics(1 / 60)
      this.accumulator -= 1 / 60
    }
    this.updateCamera(this.reducedMotion ? 1 : Math.min(1, dt * 7))
    const yaw = Math.atan2(this.camera.position.x, this.camera.position.z)
    for (const resident of this.residents) {
      resident.squish *= Math.exp(-dt * 10)
      const squish = resident.squish
      const height = Math.max(0, resident.position.y - FLOOR - RADIUS * resident.size)
      const happy = resident.happyUntil > this.elapsed ? 1.12 : 1
      const scale = resident.size * 1.85 * happy
      resident.mesh.position.copy(resident.position)
      resident.mesh.position.y += scale * (1 - squish * 0.6) * 0.43 - RADIUS * resident.size
      const flat = this.elapsed < resident.flatUntil ? 0.65 : 0
      resident.mesh.position.y -= scale * flat * 0.43
      const twist = this.activeGimmicks.has('teacup')
        ? Math.sin(this.elapsed * 9 + resident.id) * 0.45
        : 0
      resident.mesh.rotation.set(
        0,
        yaw,
        (this.activeGimmicks.has('reverse') ? Math.PI : 0) +
          twist +
          clamp(-resident.velocity.x * 0.035, -0.4, 0.4)
      )
      resident.mesh.scale.set(
        scale * (1 + squish * 0.65 + flat),
        scale * (1 - squish * 0.6 - flat),
        1
      )
      resident.shadow.position.set(resident.position.x, FLOOR + 0.006, resident.position.z)
      resident.shadow.scale.setScalar(resident.size * (1.4 + height * 0.17))
      resident.shadow.material.opacity = clamp(1 - height * 0.16, 0.12, 1)
      if (resident.balloon) {
        if (this.elapsed >= resident.balloonUntil) {
          disposeObject(resident.balloon)
          resident.balloon = null
        } else {
          resident.balloon.position.copy(resident.position)
          resident.balloon.position.y += 1.2
          resident.balloon.rotation.z = Math.sin(this.elapsed * 2 + resident.id) * 0.15
        }
      }
    }

    for (const treat of [...this.treats]) {
      treat.mesh.position.copy(treat.position)
      treat.mesh.position.y =
        (treat.falling ? Math.max(0.21, 3 - (this.elapsed - treat.born) ** 2 * 4) : 0.21) +
        Math.sin(this.elapsed * 3 + treat.born) * 0.035
      treat.mesh.rotation.y += dt * 0.3
      if (this.elapsed - treat.born > 25 && this.drag?.treat !== treat) this.removeTreat(treat)
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      particle.age += dt
      particle.mesh.position.addScaledVector(particle.velocity, dt)
      if (!particle.speech) {
        particle.velocity.y -= dt * 4
        particle.mesh.rotation.x += dt * 2
        particle.mesh.rotation.z += dt * 1.7
        particle.mesh.scale.setScalar(Math.max(0.001, 1 - particle.age / particle.life))
      } else if (particle.mesh instanceof THREE.Sprite) {
        particle.mesh.material.opacity = Math.min(1, (particle.life - particle.age) * 3)
      }
      if (particle.age > particle.life) {
        particle.mesh.removeFromParent()
        if (particle.mesh instanceof THREE.Sprite) particle.mesh.material.dispose()
        this.particles.splice(i, 1)
      }
    }

    this.trampolinePulse *= Math.exp(-dt * 7)
    if (!this.transition) this.updateGimmicks(dt)
    this.world.bed.scale.y = 1 - this.trampolinePulse * 0.5
    this.world.pinwheel.rotation.z += dt * (this.floating ? 2 : 0.45)
    this.world.rocket.position.y = 0.05 + (this.floating ? Math.sin(this.elapsed * 2) * 0.1 : 0)
    this.world.rocket.rotation.z = this.floating ? Math.sin(this.elapsed * 4) * 0.04 : 0
    for (let i = 0; i < this.world.radioBars.length; i++) {
      this.world.radioBars[i].scale.y = this.radio
        ? 1.5 + Math.sin(this.elapsed * 10 + i * 2) * 1.2
        : 0.5
    }
    if (this.sound.step(time)) {
      for (const resident of this.residents) {
        if (resident.position.y < FLOOR + RADIUS * resident.size + 0.1)
          resident.velocity.y = 2.8 + Math.random()
      }
      if (Math.random() < 0.2) this.sound.voice(1.1)
    }
    this.nightAmount = THREE.MathUtils.lerp(
      this.nightAmount,
      this.night ? 1 : 0,
      Math.min(1, dt * 2)
    )
    this.ambient.intensity = 2.8 - this.nightAmount * 1.6
    this.sun.intensity = 3 - this.nightAmount * 2.6
    this.nightLight.intensity = this.nightAmount * 9
    this.world.ground.material.color
      .set(themeById(this.theme).ground)
      .lerp(this.nightGroundColor, this.nightAmount)
    for (const bulb of this.world.bulbs)
      bulb.material.emissiveIntensity = 0.05 + this.nightAmount * 2

    this.stageContent.updateWorldMatrix(true, false)
    for (const label of this.labels) {
      const spec = themeById(this.theme).gimmicks.find(
        (entry) => entry.id === label.element.dataset.toy
      )
      const point = this.scratch.copy(label.point)
      if (spec) point.set(spec.position[0], 1.6, spec.position[1])
      point.applyMatrix4(this.stageContent.matrixWorld).project(this.camera)
      label.element.style.transform = `translate(-50%, -50%) translate(${((point.x + 1) / 2) * this.mount.clientWidth}px, ${((-point.y + 1) / 2) * this.mount.clientHeight}px)`
    }
    this.renderer.render(this.scene, this.camera)
  }

  takePhoto() {
    if (!this.ready) return null
    this.renderer.render(this.scene, this.camera)
    const photo = document.createElement('canvas')
    const source = this.renderer.domElement
    photo.width = 1400
    photo.height = Math.round((1400 * source.height) / source.width) + 140
    const ctx = photo.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = this.night ? '#34474d' : themeById(this.theme).ground
    ctx.fillRect(0, 0, photo.width, photo.height)
    ctx.drawImage(source, 20, 20, 1360, photo.height - 140)
    ctx.fillStyle = '#fffaf0'
    ctx.fillRect(0, photo.height - 120, photo.width, 120)
    ctx.fillStyle = '#655b4e'
    ctx.font = 'bold 34px "Hiragino Maru Gothic ProN", "Noto Sans CJK JP", sans-serif'
    ctx.fillText('ｽﾋﾟｷと、ひとやすみ。', 48, photo.height - 55)
    ctx.font = '19px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(
      `${new Date().toLocaleDateString('ja-JP')}  /  ${this.residents.length} ﾋﾟｷ`,
      1352,
      photo.height - 55
    )
    const result = photo.toDataURL('image/png')
    this.discover('photo')
    return result
  }

  private removeTreat(treat: Treat) {
    const index = this.treats.indexOf(treat)
    if (index < 0) return
    treat.mesh.removeFromParent()
    // Treats own their resources and can be removed independently when eaten.
    treat.mesh.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (Array.isArray(object.material))
          object.material.forEach((entry: THREE.Material) => {
            entry.dispose()
          })
        else object.material.dispose()
      }
    })
    this.treats.splice(index, 1)
  }

  private clearTreats() {
    for (const treat of [...this.treats]) this.removeTreat(treat)
  }

  private clearResidents() {
    this.cancelDrag()
    for (const resident of this.residents) {
      this.stageContent.remove(resident.mesh, resident.shadow)
      resident.mesh.material.dispose()
      resident.shadow.material.dispose()
      if (resident.balloon) disposeObject(resident.balloon)
    }
    this.residents = []
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.renderer.setAnimationLoop(null)
    this.cancelCandyPreview()
    this.resizeObserver.disconnect()
    this.cancelDrag()
    const canvas = this.renderer.domElement
    canvas.removeEventListener('pointerdown', this.pointerDown)
    canvas.removeEventListener('pointermove', this.pointerMove)
    canvas.removeEventListener('pointerup', this.pointerUp)
    canvas.removeEventListener('pointercancel', this.pointerCancel)
    canvas.removeEventListener('lostpointercapture', this.pointerCancel)
    canvas.removeEventListener('wheel', this.wheel)
    canvas.removeEventListener('keydown', this.keyDown)
    canvas.removeEventListener('webglcontextlost', this.contextLost)
    document.removeEventListener('visibilitychange', this.visibilityChanged)
    this.clearTreats()
    const geometries = new Set<THREE.BufferGeometry>([
      this.characterGeometry,
      this.shadowGeometry,
      this.starGeometry,
      this.waterGeometry,
    ])
    const materials = new Set<THREE.Material>(this.particleMaterials)
    materials.add(this.waterMaterial)
    const textures = new Set<THREE.Texture>([
      ...this.textures,
      this.shadowTexture,
      ...this.speechTextures.values(),
    ])
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) geometries.add(object.geometry)
      if (object instanceof THREE.Mesh || object instanceof THREE.Sprite) {
        const list: THREE.Material[] = Array.isArray(object.material)
          ? object.material
          : [object.material]
        for (const entry of list) {
          materials.add(entry)
          for (const value of Object.values(entry))
            if (value instanceof THREE.Texture) textures.add(value)
        }
      }
    })
    for (const geometry of geometries) geometry.dispose()
    for (const entry of materials) entry.dispose()
    for (const texture of textures) texture.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    canvas.remove()
    this.scene.clear()
    this.labels = []
  }
}
