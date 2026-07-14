import { useEffect, useRef, useState } from 'react'
import { useEarthquakeStore } from '../data/earthquakes'

const IDLE_MS = 4000

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function QuietZone() {
  const selectedEarthquake = useEarthquakeStore((s) => s.selectedEarthquake)
  const setSelectedEarthquake = useEarthquakeStore((s) => s.setSelectedEarthquake)
  const [visible, setVisible] = useState(false)
  const idleTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }

    if (!selectedEarthquake) {
      setVisible(false)
      return
    }

    setVisible(true)

    idleTimerRef.current = window.setTimeout(() => {
      setVisible(false)
      setSelectedEarthquake(null)
    }, IDLE_MS)

    return () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current)
      }
    }
  }, [selectedEarthquake, setSelectedEarthquake])

  if (!selectedEarthquake) return null

  const eq = selectedEarthquake

  return (
    <div className={`quiet-zone${visible ? ' quiet-zone--visible' : ''}`}>
      <div className="quiet-zone__panel">
        <div className="quiet-zone__mag">M {eq.mag.toFixed(1)}</div>
        <div className="quiet-zone__depth">{eq.depth.toFixed(1)} km deep</div>
        <div className="quiet-zone__place">{eq.place}</div>
        <div className="quiet-zone__time">{formatTime(eq.time)}</div>
        <a
          className="quiet-zone__link"
          href={eq.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on USGS →
        </a>
      </div>
    </div>
  )
}
