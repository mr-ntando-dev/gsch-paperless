'use client'
import { useEffect } from 'react'

/**
 * Fetches the site accent color from settings and injects CSS custom properties
 * into :root so all primary-* Tailwind classes automatically adapt.
 */
export default function ThemeProvider({ children }) {
  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.accentColor) {
          const palette = generatePalette(data.accentColor)
          const root = document.documentElement
          Object.entries(palette).forEach(([shade, color]) => {
            root.style.setProperty(`--primary-${shade}`, color)
          })
        }
      })
      .catch(() => {})
  }, [])

  return children
}

function generatePalette(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const lighten = (c, factor) => Math.min(255, Math.round(c + (255 - c) * factor))
  const darken = (c, factor) => Math.max(0, Math.round(c * (1 - factor)))
  const toHex = (r, g, b) => '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('')

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
