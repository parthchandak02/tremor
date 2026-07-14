import type { Vector3Tuple } from 'three'

export const PALETTE = {
  bg: '#0d0a08',
  globe: '#1a1410',
  ringShallow: '#ff3333',
  ringMid: '#ff8800',
  ringDeep: '#66ccff',
  ringGlow: '#ff5500',
  hero: '#ffab00',
  text: 'rgba(255,255,255,0.5)',
  stamp: 'rgba(255,255,255,0.35)',
} as const

export const GLOBE_RADIUS = 2

export interface Earthquake {
  id: string
  mag: number
  place: string
  time: number
  depth: number
  lat: number
  lon: number
  url: string
}

export function depthColor(depth: number): string {
  if (depth < 33) return PALETTE.ringShallow
  if (depth <= 150) return PALETTE.ringMid
  return PALETTE.ringDeep
}

export function depthLabel(depth: number): string {
  if (depth < 33) return 'shallow'
  if (depth <= 150) return 'mid'
  return 'deep'
}

const MAG_MIN = 2.5
const MAG_MAX = 7

function normalizeMag(mag: number): number {
  return Math.min(1, Math.max(0, (mag - MAG_MIN) / (MAG_MAX - MAG_MIN)))
}

/** Outer ring radius in world units (0.3-2.5 earth radii). */
export function magToRingRadius(mag: number): number {
  const t = normalizeMag(mag)
  return (0.3 + t * (2.5 - 0.3)) * GLOBE_RADIUS
}

/** Expansion speed multiplier (0.3-2.0x base). */
export function magToExpandSpeed(mag: number): number {
  const t = normalizeMag(mag)
  return 0.3 + t * (2.0 - 0.3)
}

export function latLonToPosition(
  lat: number,
  lon: number,
  radius: number,
): Vector3Tuple {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  return [x, y, z]
}
