import { useEarthquakeStore } from '../data/earthquakes'
import Globe from './Globe'
import Ring from './Ring'

interface EarthquakeFieldProps {
  reducedMotion?: boolean
}

export default function EarthquakeField({ reducedMotion = false }: EarthquakeFieldProps) {
  const earthquakes = useEarthquakeStore((s) => s.earthquakes)

  return (
    <group>
      <Globe reducedMotion={reducedMotion} />
      {earthquakes.map((eq) => (
        <Ring key={eq.id} earthquake={eq} reducedMotion={reducedMotion} />
      ))}
    </group>
  )
}
