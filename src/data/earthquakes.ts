import { create } from 'zustand'
import type { Earthquake } from '../types'

const USGS_URL =
  'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&orderby=magnitude&limit=50'

const POLL_INTERVAL_MS = 60_000

/** Five real USGS events from Jul 14, 2026. */
export const FALLBACK_EARTHQUAKES: Earthquake[] = [
  {
    id: 'us7000t0d0',
    mag: 6.2,
    place: '34 km WSW of Sarangani, Philippines',
    time: 1784044181603,
    depth: 67.854,
    lat: 5.3269,
    lon: 125.1655,
    url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us7000t0d0',
  },
  {
    id: 'us7000t0a3',
    mag: 5.6,
    place: '11 km N of Pichigua, Peru',
    time: 1784017266499,
    depth: 140.088,
    lat: -14.5779,
    lon: -71.4358,
    url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us7000t0a3',
  },
  {
    id: 'us7000t0fu',
    mag: 5.4,
    place: '90 km SSE of False Pass, Alaska',
    time: 1784055067308,
    depth: 47.044,
    lat: 54.1759,
    lon: -162.6381,
    url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us7000t0fu',
  },
  {
    id: 'us7000t0b5',
    mag: 5.3,
    place: '96 km SE of False Pass, Alaska',
    time: 1784031139529,
    depth: 40.773,
    lat: 54.1456,
    lon: -162.543,
    url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us7000t0b5',
  },
  {
    id: 'us7000t09m',
    mag: 5.2,
    place: '14 km WSW of Mabiton, Philippines',
    time: 1784012694275,
    depth: 10,
    lat: 12.7967,
    lon: 123.136,
    url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us7000t09m',
  },
]

interface GeoJsonFeature {
  id: string
  properties: {
    mag: number
    place: string
    time: number
    url: string
  }
  geometry: {
    coordinates: [number, number, number]
  }
}

interface GeoJsonResponse {
  features: GeoJsonFeature[]
}

function parseFeature(feature: GeoJsonFeature): Earthquake {
  const [lon, lat, depth] = feature.geometry.coordinates
  return {
    id: feature.id,
    mag: feature.properties.mag,
    place: feature.properties.place,
    time: feature.properties.time,
    depth,
    lat,
    lon,
    url: feature.properties.url,
  }
}

export let lastFetchTime: number | null = null

export async function fetchEarthquakes(): Promise<Earthquake[]> {
  const response = await fetch(USGS_URL)
  if (!response.ok) throw new Error(`USGS fetch failed: ${response.status}`)
  const data = (await response.json()) as GeoJsonResponse
  return data.features.map(parseFeature)
}

interface EarthquakeStore {
  earthquakes: Earthquake[]
  isFallback: boolean
  lastFetchTime: number | null
  selectedEarthquake: Earthquake | null
  setEarthquakes: (earthquakes: Earthquake[], isFallback: boolean) => void
  setSelectedEarthquake: (earthquake: Earthquake | null) => void
}

export const useEarthquakeStore = create<EarthquakeStore>((set) => ({
  earthquakes: FALLBACK_EARTHQUAKES,
  isFallback: true,
  lastFetchTime: null,
  selectedEarthquake: null,
  setEarthquakes: (earthquakes, isFallback) => {
    const now = Date.now()
    lastFetchTime = now
    set({ earthquakes, isFallback, lastFetchTime: now })
  },
  setSelectedEarthquake: (earthquake) => set({ selectedEarthquake: earthquake }),
}))

async function loadEarthquakes(): Promise<void> {
  try {
    const earthquakes = await fetchEarthquakes()
    useEarthquakeStore.getState().setEarthquakes(earthquakes, false)
  } catch {
    useEarthquakeStore
      .getState()
      .setEarthquakes(FALLBACK_EARTHQUAKES, true)
  }
}

let pollStarted = false

export function startEarthquakePolling(): () => void {
  if (pollStarted) return () => undefined
  pollStarted = true

  void loadEarthquakes()
  const intervalId = window.setInterval(() => {
    void loadEarthquakes()
  }, POLL_INTERVAL_MS)

  return () => {
    window.clearInterval(intervalId)
    pollStarted = false
  }
}
