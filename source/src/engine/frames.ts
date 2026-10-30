export interface ShotManifest {
  from: number
  to: number
  box: [number, number, number, number] // [x, y, w, h]
  cx: number
}

export interface FramesManifest {
  w: number
  h: number
  count: number
  shots: ShotManifest[]
}

export type FramesProgressCallback = (progress: number, loadedCount: number, totalCount: number) => void

class FrameLoader {
  public manifest: FramesManifest | null = null
  private loadedImages: Map<number, HTMLImageElement> = new Map()
  private isMobile = false
  private totalCount = 239
  private loadedCount = 0
  private progressCallbacks: Set<FramesProgressCallback> = new Set()
  private firstQuarterPromise: Promise<void> | null = null
  private resolveFirstQuarter: (() => void) | null = null
  private isFirstQuarterResolved = false

  constructor() {
    this.firstQuarterPromise = new Promise((resolve) => {
      this.resolveFirstQuarter = resolve
    })
  }

  public async init(onProgress?: FramesProgressCallback): Promise<void> {
    if (onProgress) {
      this.progressCallbacks.add(onProgress)
    }

    this.isMobile = typeof window !== 'undefined' && window.innerWidth < 820

    try {
      const res = await fetch('./frames/manifest.json')
      if (res.ok) {
        this.manifest = await res.json()
        if (this.manifest && this.manifest.count) {
          this.totalCount = this.manifest.count
        }
      }
    } catch {
      console.warn('Could not fetch manifest.json, using fallback configuration.')
    }

    if (!this.manifest) {
      // Default fallback manifest
      this.manifest = {
        w: 1600,
        h: 900,
        count: 239,
        shots: [
          { from: 0, to: 59, box: [200, 50, 1200, 850], cx: 0.5 },
          { from: 60, to: 119, box: [200, 50, 1200, 850], cx: 0.5 },
          { from: 120, to: 191, box: [100, 50, 1400, 850], cx: 0.5 },
          { from: 192, to: 238, box: [200, 50, 1200, 850], cx: 0.5 },
        ],
      }
      this.totalCount = this.manifest.count
    }

    // Start loading queue
    this.startLoadingQueue()
  }

  public waitForFirstQuarter(): Promise<void> {
    if (this.isFirstQuarterResolved) {
      return Promise.resolve()
    }
    return this.firstQuarterPromise || Promise.resolve()
  }

  private startLoadingQueue() {
    const total = this.totalCount
    const folder = this.isMobile ? './frames/sm' : './frames/lg'
    const queue: number[] = []
    const queuedSet = new Set<number>()

    // 1. Shot boundaries first
    if (this.manifest) {
      this.manifest.shots.forEach((shot) => {
        if (!queuedSet.has(shot.from)) {
          queue.push(shot.from)
          queuedSet.add(shot.from)
        }
        if (!queuedSet.has(shot.to)) {
          queue.push(shot.to)
          queuedSet.add(shot.to)
        }
      })
    }

    // 2. Stride 8 -> 4 -> 2 -> 1
    const strides = [8, 4, 2, 1]
    strides.forEach((stride) => {
      for (let i = 0; i < total; i += stride) {
        if (!queuedSet.has(i)) {
          queue.push(i)
          queuedSet.add(i)
        }
      }
    })

    // Quarter threshold
    const quarterThreshold = Math.max(1, Math.ceil(total / 4))

    // Stream load with concurrency of 4
    const concurrency = 4
    let cursor = 0

    const loadNext = async () => {
      while (cursor < queue.length) {
        const frameIdx = queue[cursor++]
        await this.loadSingleFrame(frameIdx, folder)

        // Check first quarter completion
        if (!this.isFirstQuarterResolved && this.loadedCount >= quarterThreshold) {
          this.isFirstQuarterResolved = true
          this.resolveFirstQuarter?.()
        }
      }
    }

    for (let c = 0; c < concurrency; c++) {
      loadNext()
    }
  }

  private async loadSingleFrame(frameIdx: number, folder: string): Promise<void> {
    if (this.loadedImages.has(frameIdx)) return

    const padIdx = String(frameIdx).padStart(3, '0')
    const src = `${folder}/f${padIdx}.webp`

    const img = new Image()
    img.src = src

    try {
      await img.decode()
      this.loadedImages.set(frameIdx, img)
    } catch {
      // Fallback: try loading without decode or handle error
      try {
        await new Promise((resolve, reject) => {
          img.onload = () => resolve(img)
          img.onerror = reject
        })
        this.loadedImages.set(frameIdx, img)
      } catch {
        // Image missing or failed to load
      }
    }

    this.loadedCount++
    const progress = Math.min(this.loadedCount / this.totalCount, 1)
    this.progressCallbacks.forEach((cb) => cb(progress, this.loadedCount, this.totalCount))
  }

  public getFrame(f: number, shotIndex: number): HTMLImageElement | null {
    const idx = Math.round(f)

    // Direct hit
    if (this.loadedImages.has(idx)) {
      return this.loadedImages.get(idx)!
    }

    // Fall back to nearest loaded frame in the same shot
    if (!this.manifest || !this.manifest.shots[shotIndex]) {
      // Fall back to any nearest loaded frame
      let closest: HTMLImageElement | null = null
      let minDist = Infinity
      this.loadedImages.forEach((img, loadedIdx) => {
        const dist = Math.abs(loadedIdx - idx)
        if (dist < minDist) {
          minDist = dist
          closest = img
        }
      })
      return closest
    }

    const shot = this.manifest.shots[shotIndex]
    let closestInShot: HTMLImageElement | null = null
    let minDistInShot = Infinity

    for (let s = shot.from; s <= shot.to; s++) {
      if (this.loadedImages.has(s)) {
        const dist = Math.abs(s - idx)
        if (dist < minDistInShot) {
          minDistInShot = dist
          closestInShot = this.loadedImages.get(s)!
        }
      }
    }

    if (closestInShot) return closestInShot

    // If no frame in shot is loaded yet, return nearest overall
    let fallback: HTMLImageElement | null = null
    let minDist = Infinity
    this.loadedImages.forEach((img, loadedIdx) => {
      const dist = Math.abs(loadedIdx - idx)
      if (dist < minDist) {
        minDist = dist
        fallback = img
      }
    })

    return fallback
  }

  public getShotBoxAndCx(shotIndex: number): { box: [number, number, number, number]; cx: number } {
    if (this.manifest && this.manifest.shots[shotIndex]) {
      return {
        box: this.manifest.shots[shotIndex].box,
        cx: this.manifest.shots[shotIndex].cx,
      }
    }
    return {
      box: [0, 0, 1600, 900],
      cx: 0.5,
    }
  }

  public getLoadedCount(): number {
    return this.loadedCount
  }
}

export const frameLoader = new FrameLoader()
if (typeof window !== 'undefined') {
  ;(window as any).frameLoader = frameLoader
}
