/**
 * Extract the dominant color from an image buffer (PNG/JPEG).
 * Uses a simple pixel-sampling approach — no external deps needed.
 * Returns a hex color string like "#1d4ed8".
 */
export function extractDominantColor(buffer, mimeType) {
  // For non-raster (SVG) just return null — can't sample pixels
  if (mimeType === 'image/svg+xml') return null

  // Parse raw pixel data from PNG/JPEG using a lightweight approach:
  // Sample bytes from the image data and find the most common non-white, non-black color.
  const bytes = new Uint8Array(buffer)

  // Simple approach: scan through the raw buffer looking for color patterns
  // We'll sample every Nth byte triplet and build a color histogram
  const colorCounts = {}
  const step = Math.max(3, Math.floor(bytes.length / 3000)) // Sample ~1000 pixels

  for (let i = 0; i < bytes.length - 2; i += step) {
    const r = bytes[i]
    const g = bytes[i + 1]
    const b = bytes[i + 2]

    // Skip near-white, near-black, and very gray pixels
    const brightness = (r + g + b) / 3
    if (brightness > 240 || brightness < 15) continue
    const saturation = Math.max(r, g, b) - Math.min(r, g, b)
    if (saturation < 30) continue // skip grays

    // Quantize to reduce noise (group similar colors)
    const qr = Math.round(r / 32) * 32
    const qg = Math.round(g / 32) * 32
    const qb = Math.round(b / 32) * 32
    const key = `${qr},${qg},${qb}`
    colorCounts[key] = (colorCounts[key] || 0) + 1
  }

  // Find the most frequent color
  let maxCount = 0
  let dominant = null
  for (const [key, count] of Object.entries(colorCounts)) {
    if (count > maxCount) {
      maxCount = count
      dominant = key
    }
  }

  if (!dominant) return null

  const [r, g, b] = dominant.split(',').map(Number)
  const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
  return hex
}

/**
 * Generate a full palette (50-900) from a base hex color.
 * Returns an object { 50: '#...', 100: '#...', ..., 900: '#...' }
 */
export function generatePalette(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Generate lighter and darker variants
  const lighten = (c, factor) => Math.min(255, Math.round(c + (255 - c) * factor))
  const darken = (c, factor) => Math.max(0, Math.round(c * (1 - factor)))

  return {
    50: toHex(lighten(r, 0.92), lighten(g, 0.92), lighten(b, 0.92)),
    100: toHex(lighten(r, 0.8), lighten(g, 0.8), lighten(b, 0.8)),
    200: toHex(lighten(r, 0.6), lighten(g, 0.6), lighten(b, 0.6)),
    300: toHex(lighten(r, 0.4), lighten(g, 0.4), lighten(b, 0.4)),
    400: toHex(lighten(r, 0.2), lighten(g, 0.2), lighten(b, 0.2)),
    500: hex,
    600: toHex(darken(r, 0.15), darken(g, 0.15), darken(b, 0.15)),
    700: toHex(darken(r, 0.3), darken(g, 0.3), darken(b, 0.3)),
    800: toHex(darken(r, 0.45), darken(g, 0.45), darken(b, 0.45)),
    900: toHex(darken(r, 0.6), darken(g, 0.6), darken(b, 0.6)),
  }
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('')
}
