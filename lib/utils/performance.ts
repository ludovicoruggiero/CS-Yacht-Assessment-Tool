export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()

  static start(label: string): void {
    this.timers.set(label, performance.now())
  }

  static end(label: string): number {
    const startTime = this.timers.get(label)
    if (!startTime) {
      console.warn(`No timer found for label: ${label}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(label)

    if (process.env.NODE_ENV === "development") {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label)
    const result = fn()
    this.end(label)
    return result
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label)
    const result = await fn()
    this.end(label)
    return result
  }
}
