import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { GLOBE_RADIUS, PALETTE } from '../types'

interface GlobeProps {
  reducedMotion?: boolean
}

export default function Globe({ reducedMotion = false }: GlobeProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (reducedMotion || !meshRef.current) return
    meshRef.current.rotation.y += 0.15 * delta
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshBasicMaterial color={PALETTE.globe} />
    </mesh>
  )
}
