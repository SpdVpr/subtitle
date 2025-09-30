'use client'

/**
 * Browser Fingerprinting Utility
 * Generates a unique fingerprint for the browser to detect duplicate registrations
 * 
 * This combines multiple browser characteristics to create a unique identifier
 * that persists across sessions but is difficult to fake.
 */

export interface BrowserFingerprint {
  fingerprint: string
  components: {
    userAgent: string
    language: string
    colorDepth: number
    deviceMemory: number | undefined
    hardwareConcurrency: number | undefined
    screenResolution: string
    timezone: string
    platform: string
    vendor: string
    plugins: string[]
    canvas: string
    webgl: string
    fonts: string[]
  }
}

/**
 * Generate a hash from a string using a simple hash function
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get installed fonts by testing common fonts
 */
function getInstalledFonts(): string[] {
  const baseFonts = ['monospace', 'sans-serif', 'serif']
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
    'Impact', 'Lucida Console', 'Tahoma', 'Helvetica', 'Calibri'
  ]
  
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return []
  
  const text = 'mmmmmmmmmmlli'
  const textSize = '72px'
  
  const baseFontWidths: Record<string, number> = {}
  baseFonts.forEach(baseFont => {
    context.font = `${textSize} ${baseFont}`
    baseFontWidths[baseFont] = context.measureText(text).width
  })
  
  const installedFonts: string[] = []
  testFonts.forEach(font => {
    baseFonts.forEach(baseFont => {
      context.font = `${textSize} '${font}', ${baseFont}`
      const width = context.measureText(text).width
      if (width !== baseFontWidths[baseFont]) {
        if (!installedFonts.includes(font)) {
          installedFonts.push(font)
        }
      }
    })
  })
  
  return installedFonts.sort()
}

/**
 * Generate canvas fingerprint
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no-canvas'
    
    canvas.width = 200
    canvas.height = 50
    
    // Draw text with specific styling
    ctx.textBaseline = 'top'
    ctx.font = '14px "Arial"'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('SubtitleAI 🎬', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('SubtitleAI 🎬', 4, 17)
    
    // Get canvas data
    const dataUrl = canvas.toDataURL()
    return simpleHash(dataUrl)
  } catch (e) {
    return 'canvas-error'
  }
}

/**
 * Generate WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    if (!gl) return 'no-webgl'
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return 'no-debug-info'
    
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    
    return simpleHash(`${vendor}~${renderer}`)
  } catch (e) {
    return 'webgl-error'
  }
}

/**
 * Get browser plugins
 */
function getPlugins(): string[] {
  if (!navigator.plugins) return []
  
  const plugins: string[] = []
  for (let i = 0; i < navigator.plugins.length; i++) {
    const plugin = navigator.plugins[i]
    if (plugin && plugin.name) {
      plugins.push(plugin.name)
    }
  }
  return plugins.sort()
}

/**
 * Generate complete browser fingerprint
 */
export async function generateBrowserFingerprint(): Promise<BrowserFingerprint> {
  // Collect all components
  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    colorDepth: screen.colorDepth,
    deviceMemory: (navigator as any).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    screenResolution: `${screen.width}x${screen.height}x${screen.pixelDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    vendor: navigator.vendor,
    plugins: getPlugins(),
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    fonts: getInstalledFonts()
  }
  
  // Create fingerprint string from all components
  const fingerprintString = [
    components.userAgent,
    components.language,
    components.colorDepth,
    components.deviceMemory,
    components.hardwareConcurrency,
    components.screenResolution,
    components.timezone,
    components.platform,
    components.vendor,
    components.plugins.join(','),
    components.canvas,
    components.webgl,
    components.fonts.join(',')
  ].join('|')
  
  // Generate hash
  const fingerprint = simpleHash(fingerprintString)
  
  return {
    fingerprint,
    components
  }
}

/**
 * Get a simplified fingerprint (faster, less accurate)
 */
export function getQuickFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.platform
  ].join('|')
  
  return simpleHash(components)
}

/**
 * Store fingerprint in localStorage for consistency
 */
export function storeFingerprint(fingerprint: string): void {
  try {
    localStorage.setItem('browser_fingerprint', fingerprint)
    localStorage.setItem('fingerprint_created', new Date().toISOString())
  } catch (e) {
    console.warn('Failed to store fingerprint:', e)
  }
}

/**
 * Get stored fingerprint from localStorage
 */
export function getStoredFingerprint(): string | null {
  try {
    return localStorage.getItem('browser_fingerprint')
  } catch (e) {
    return null
  }
}

/**
 * Get or generate fingerprint
 * First checks localStorage, then generates new one if needed
 */
export async function getOrGenerateFingerprint(): Promise<string> {
  // Check if we have a stored fingerprint
  const stored = getStoredFingerprint()
  if (stored) {
    return stored
  }
  
  // Generate new fingerprint
  const result = await generateBrowserFingerprint()
  storeFingerprint(result.fingerprint)
  
  return result.fingerprint
}

