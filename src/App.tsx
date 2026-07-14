import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import Background from './components/Background'
import EarthquakeField from './components/EarthquakeField'
import HeroStats from './components/HeroStats'
import DataStamp from './components/DataStamp'
import Description from './components/Description'
import Legend from './components/Legend'
import QuietZone from './components/QuietZone'
import { startEarthquakePolling } from './data/earthquakes'

function SceneLoader() {
  return (
    <Html center>
      <div className="loading-spinner" />
    </Html>
  )
}

export default function App() {
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => startEarthquakePolling(), [])

  return (
    <div className="app">
      <Canvas
        className="app__canvas"
        frameloop={reducedMotion ? 'demand' : 'always'}
        dpr={Math.min(window.devicePixelRatio, 2)}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        }}
      >
        <Suspense fallback={<SceneLoader />}>
          <Background />
          <EarthquakeField reducedMotion={reducedMotion} />
          <OrbitControls
            enableDamping
            minDistance={3}
            maxDistance={15}
          />
        </Suspense>
      </Canvas>

      <div className="app__chrome">
        <HeroStats />
        <DataStamp />
        <Description />
        <Legend />
        <QuietZone />
      </div>
    </div>
  )
}
