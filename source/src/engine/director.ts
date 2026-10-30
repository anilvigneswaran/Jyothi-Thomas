import Lenis from 'lenis'
import gsap from 'gsap'

export interface SceneConfig {
  id: string
  label: string
  from: number
  to: number
  x: number
  k: number
  heightVh: number
  shotIndex: number
}

export const SCENES: SceneConfig[] = [
  { id: 'hero', label: 'Hello', from: 0, to: 59, x: 0.70, k: 1.0, heightVh: 230, shotIndex: 0 },
  { id: 'about', label: 'About', from: 60, to: 119, x: 0.27, k: 1.0, heightVh: 280, shotIndex: 1 },
  { id: 'work', label: 'Work', from: 120, to: 191, x: 0.77, k: 0.86, heightVh: 460, shotIndex: 2 },
  { id: 'journey', label: 'Journey', from: 192, to: 220, x: 0.26, k: 1.0, heightVh: 240, shotIndex: 3 },
  { id: 'skills', label: 'Toolkit', from: 220, to: 231, x: 0.50, k: 0.98, heightVh: 280, shotIndex: 3 },
  { id: 'awards', label: 'Awards', from: 231, to: 238, x: 0.75, k: 1.0, heightVh: 320, shotIndex: 3 },
  { id: 'contact', label: 'Contact', from: 59, to: 0, x: 0.50, k: 1.0, heightVh: 240, shotIndex: 0 },
]

export interface SceneMetrics {
  enter: number
  p: number
  exit: number
  vis: number
}

export interface TransitionState {
  isTransitioning: boolean
  t: number
  outgoingScene: SceneConfig | null
  incomingScene: SceneConfig | null
  isToContact: boolean
}

export interface FrameState {
  activeScene: SceneConfig
  activeSceneIndex: number
  frame: number
  transition: TransitionState
  x: number
  k: number
  shotIndex: number
}

export interface DirectorState {
  scrollY: number
  progress: number
  vw: number
  vh: number
  scenes: { [sceneId: string]: SceneMetrics }
  frameState: FrameState
  mouseX: number
  mouseY: number
  targetMouseX: number
  targetMouseY: number
}

export type DirectorSubscriber = (state: DirectorState) => void

export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(Math.max(v, min), max)
}

export function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2
}

export function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4)
}

class Director {
  private lenis: Lenis | null = null
  private subscribers: Set<DirectorSubscriber> = new Set()
  private sectionElements: Map<string, HTMLElement> = new Map()
  private sectionBounds: Map<string, { top: number; height: number }> = new Map()
  private resizeObserver: ResizeObserver | null = null
  public isPreloaderFinished = false

  public state: DirectorState = {
    scrollY: 0,
    progress: 0,
    vw: typeof window !== 'undefined' ? window.innerWidth : 1600,
    vh: typeof window !== 'undefined' ? window.innerHeight : 900,
    scenes: {},
    frameState: {
      activeScene: SCENES[0],
      activeSceneIndex: 0,
      frame: SCENES[0].from,
      transition: {
        isTransitioning: false,
        t: 0,
        outgoingScene: null,
        incomingScene: null,
        isToContact: false,
      },
      x: SCENES[0].x,
      k: SCENES[0].k,
      shotIndex: SCENES[0].shotIndex,
    },
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
  }

  constructor() {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
    }
  }

  public init() {
    if (typeof window === 'undefined') return

    // Configure Lenis as { lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 }
    this.lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    })

    // Stopped until preloader finishes
    this.lenis.stop()

    // Drive Lenis from gsap.ticker with lagSmoothing(0)
    gsap.ticker.lagSmoothing(0)
    const tickerCallback = (time: number) => {
      this.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)

    this.lenis.on('scroll', (e: { scroll: number }) => {
      this.handleScroll(e.scroll)
    })
    window.addEventListener('scroll', () => {
      this.handleScroll(window.scrollY)
    })

    window.addEventListener('resize', this.handleResize)
    window.addEventListener('mousemove', this.handleMouseMove)

    this.updateDimensions()
    this.measureSections()
    this.setupResizeObserver()
    this.handleScroll(0)
  }

  public registerSection(id: string, el: HTMLElement | null) {
    if (el) {
      this.sectionElements.set(id, el)
      this.measureSections()
    } else {
      this.sectionElements.delete(id)
    }
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return
    this.resizeObserver = new ResizeObserver(() => {
      this.measureSections()
      this.handleScroll(this.state.scrollY)
    })
    this.resizeObserver.observe(document.body)
  }

  public measureSections() {
    const vh = window.innerHeight
    let accumulatedTop = 0

    SCENES.forEach((scene) => {
      const el = this.sectionElements.get(scene.id)
      let height = (scene.heightVh / 100) * vh
      let top = accumulatedTop

      if (el) {
        const offsetTop = el.offsetTop
        const rectHeight = el.offsetHeight
        if (rectHeight > 0) height = rectHeight
        if (offsetTop > 0) top = offsetTop
      }

      this.sectionBounds.set(scene.id, { top, height })
      accumulatedTop = top + height
    })
  }

  private updateDimensions() {
    this.state.vw = window.innerWidth
    this.state.vh = window.innerHeight
  }

  private handleResize = () => {
    this.updateDimensions()
    this.measureSections()
    this.handleScroll(this.state.scrollY)
  }

  private handleMouseMove = (e: MouseEvent) => {
    // Normalized to -1..1
    this.state.targetMouseX = (e.clientX / this.state.vw) * 2 - 1
    this.state.targetMouseY = (e.clientY / this.state.vh) * 2 - 1
  }

  public finishPreloader() {
    this.isPreloaderFinished = true
    this.lenis?.start()
    this.handleScroll(window.scrollY || 0)
  }

  public scrollToScene(index: number) {
    if (!this.lenis) return
    const scene = SCENES[index]
    if (!scene) return
    const bounds = this.sectionBounds.get(scene.id)
    if (!bounds) return

    // Scroll with Lenis over 2.2s using easeOutQuart
    this.lenis.scrollTo(bounds.top, {
      duration: 2.2,
      easing: easeOutQuart,
    })
  }

  public scrollToTop() {
    if (!this.lenis) return
    this.lenis.scrollTo(0, {
      duration: 2.2,
      easing: easeOutQuart,
    })
  }

  public handleScroll(y: number) {
    const vh = this.state.vh
    this.state.scrollY = y

    // Total track height
    const lastScene = SCENES[SCENES.length - 1]
    const lastBounds = this.sectionBounds.get(lastScene.id)
    const maxScroll = lastBounds ? lastBounds.top + lastBounds.height - vh : 1
    this.state.progress = clamp(y / Math.max(maxScroll, 1))

    // Smooth mouse parallax lerp 0.06
    this.state.mouseX += (this.state.targetMouseX - this.state.mouseX) * 0.06
    this.state.mouseY += (this.state.targetMouseY - this.state.mouseY) * 0.06

    // Compute metrics for each scene:
    // enter = clamp((y−(top−vh))/vh)
    // p = clamp((y−top)/(h−vh))
    // exit = clamp((y−(top+h−vh))/vh)
    // vis = clamp(min(enter·1.6, 1−exit·2.2))
    SCENES.forEach((scene) => {
      const bounds = this.sectionBounds.get(scene.id) || { top: 0, height: vh }
      const top = bounds.top
      const h = bounds.height

      const enter = clamp((y - (top - vh)) / Math.max(vh, 1))
      const p = clamp((y - top) / Math.max(h - vh, 1))
      const exit = clamp((y - (top + h - vh)) / Math.max(vh, 1))
      const vis = clamp(Math.min(enter * 1.6, 1 - exit * 2.2))

      this.state.scenes[scene.id] = { enter, p, exit, vis }
    })

    // Active scene & frame calculation:
    // lead = 0.78vh and span = 0.62vh.
    // The active scene is the last one where y >= top - lead.
    const lead = 0.78 * vh
    const span = 0.62 * vh

    let activeIndex = 0
    for (let i = 0; i < SCENES.length; i++) {
      const bounds = this.sectionBounds.get(SCENES[i].id)
      if (bounds && y >= bounds.top - lead) {
        activeIndex = i
      }
    }

    const activeScene = SCENES[activeIndex]
    const activeMetrics = this.state.scenes[activeScene.id] || { enter: 1, p: 0, exit: 0, vis: 1 }

    // Fractional frame within active scene: from + (to - from) * p
    const baseFrame = activeScene.from + (activeScene.to - activeScene.from) * activeMetrics.p

    // Transition calculation:
    // Transition using t = easeInOutSine(clamp((y−(top−lead))/span))
    // between the previous scene's last frame and the next scene's first frame.
    let isTransitioning = false
    let t = 0
    let outgoingScene: SceneConfig | null = null
    let incomingScene: SceneConfig | null = null
    let isToContact = false

    if (activeIndex > 0) {
      const currentBounds = this.sectionBounds.get(activeScene.id)
      if (currentBounds) {
        const transDist = y - (currentBounds.top - lead)
        if (transDist >= 0 && transDist <= span) {
          isTransitioning = true
          t = easeInOutSine(clamp(transDist / span))
          outgoingScene = SCENES[activeIndex - 1]
          incomingScene = activeScene
          isToContact = activeScene.id === 'contact'
        }
      }
    }

    this.state.frameState = {
      activeScene,
      activeSceneIndex: activeIndex,
      frame: baseFrame,
      transition: {
        isTransitioning,
        t,
        outgoingScene,
        incomingScene,
        isToContact,
      },
      x: activeScene.x,
      k: activeScene.k,
      shotIndex: activeScene.shotIndex,
    }

    // Notify all subscribers
    this.notify()
  }

  public subscribe(cb: DirectorSubscriber): () => void {
    this.subscribers.add(cb)
    // Send immediate initial state
    cb(this.state)
    return () => {
      this.subscribers.delete(cb)
    }
  }

  private notify() {
    this.subscribers.forEach((cb) => cb(this.state))
  }

  public destroy() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('mousemove', this.handleMouseMove)
    this.resizeObserver?.disconnect()
    this.lenis?.destroy()
  }
}

export const director = new Director()
if (typeof window !== 'undefined') {
  ;(window as any).director = director
}
