import { useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import {
  AdditiveBlending,
  DoubleSide,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
  type Mesh,
} from 'three'
import {
  depthColor,
  GLOBE_RADIUS,
  latLonToPosition,
  magToExpandSpeed,
  magToRingRadius,
  PALETTE,
  type Earthquake,
} from '../types'
import { useEarthquakeStore } from '../data/earthquakes'

const UP = new Vector3(0, 0, 1)
const BASE_EXPAND_DURATION = 4
const FADE_DURATION = 6

interface RingProps {
  earthquake: Earthquake
  reducedMotion?: boolean
}

export default function Ring({ earthquake, reducedMotion = false }: RingProps) {
  const meshRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const colorMatRef = useRef<MeshBasicMaterial>(null)
  const glowMatRef = useRef<MeshBasicMaterial>(null)
  const elapsedRef = useRef(0)
  const lastTapRef = useRef(0)
  const setSelectedEarthquake = useEarthquakeStore((s) => s.setSelectedEarthquake)
  const invalidate = useThree((s) => s.invalidate)

  const surfacePos = latLonToPosition(earthquake.lat, earthquake.lon, GLOBE_RADIUS + 0.02)
  const normal = new Vector3(...surfacePos).normalize()
  const quaternion = new Quaternion().setFromUnitVectors(UP, normal)
  const outerRadius = magToRingRadius(earthquake.mag)
  const innerRadius = outerRadius * 0.88
  const color = depthColor(earthquake.depth)
  const expandSpeed = magToExpandSpeed(earthquake.mag)

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    const now = Date.now()
    if (now - lastTapRef.current < 300) return
    lastTapRef.current = now
    setSelectedEarthquake(earthquake)
  }

  useFrame((_, delta) => {
    elapsedRef.current += delta * expandSpeed
    const expandT = Math.min(elapsedRef.current / BASE_EXPAND_DURATION, 1)
    const fadeT = Math.min(elapsedRef.current / FADE_DURATION, 1)
    const scale = expandT
    const opacity = 0.9 * (1 - fadeT)

    if (meshRef.current) meshRef.current.scale.setScalar(scale)
    if (glowRef.current) glowRef.current.scale.setScalar(scale * 1.15)
    if (colorMatRef.current) colorMatRef.current.opacity = opacity
    if (glowMatRef.current) glowMatRef.current.opacity = opacity * 0.35

    if (reducedMotion) invalidate()
  })

  return (
    <group position={surfacePos} quaternion={quaternion}>
      <mesh
        ref={glowRef}
        onPointerDown={handlePointerDown}
      >
        <ringGeometry args={[innerRadius * 0.92, outerRadius * 1.08, 48]} />
        <meshBasicMaterial
          ref={glowMatRef}
          color={PALETTE.ringGlow}
          transparent
          opacity={0.3}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <mesh ref={meshRef} onPointerDown={handlePointerDown}>
        <ringGeometry args={[innerRadius, outerRadius, 48]} />
        <meshBasicMaterial
          ref={colorMatRef}
          color={color}
          transparent
          opacity={0.9}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <mesh visible={false} onPointerDown={handlePointerDown} scale={2.2}>
        <ringGeometry args={[innerRadius, outerRadius, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
