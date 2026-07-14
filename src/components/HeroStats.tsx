import { useEarthquakeStore } from '../data/earthquakes'

export default function HeroStats() {
  const earthquakes = useEarthquakeStore((s) => s.earthquakes)
  const maxMag = earthquakes.reduce((max, eq) => Math.max(max, eq.mag), 0)

  return (
    <div className="hero-stats">
      <div className="hero-stats__value">{maxMag.toFixed(1)}</div>
      <div className="hero-stats__label">strongest quake</div>
    </div>
  )
}
