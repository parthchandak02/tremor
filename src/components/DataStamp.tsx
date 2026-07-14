import { useEffect, useState } from 'react'
import { useEarthquakeStore } from '../data/earthquakes'

export default function DataStamp() {
  const earthquakes = useEarthquakeStore((s) => s.earthquakes)
  const isFallback = useEarthquakeStore((s) => s.isFallback)
  const lastFetchTime = useEarthquakeStore((s) => s.lastFetchTime)
  const [secondsAgo, setSecondsAgo] = useState(0)

  const maxMag = earthquakes.reduce((max, eq) => Math.max(max, eq.mag), 0)

  useEffect(() => {
    const tick = () => {
      if (lastFetchTime === null) {
        setSecondsAgo(0)
        return
      }
      setSecondsAgo(Math.floor((Date.now() - lastFetchTime) / 1000))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [lastFetchTime])

  const sourceLabel = isFallback ? 'fallback' : 'live'

  return (
    <div className="data-stamp">
      USGS Earthquakes · {earthquakes.length} events · Mmax {maxMag.toFixed(1)} ·{' '}
      {sourceLabel} · updated {secondsAgo}s ago
    </div>
  )
}
