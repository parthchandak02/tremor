# tremor — Creative Brief

## Concept
A 3D globe showing live USGS earthquakes as glowing ripple rings. Earthquakes appear at their exact geographic positions on a rotating Earth sphere. Ring size = magnitude, ring color = depth (red = shallow, amber = mid, blue = deep). Rings expand outward and fade. Hero number shows the strongest quake in the current batch.

**Narrative Pattern:** Drill-down — overview with globe and all earthquake rings visible, tap a ring to reveal earthquake detail panel.

**Tier 2 Patterns (pick 2):** Hero Number + Quiet Zone

## Render tier
r3f — Vite + R3F + drei, Cloudflare Pages

## Data Source
- **API:** USGS Earthquake Catalog: `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&orderby=magnitude&limit=50`
- **Poll interval:** 60 seconds (setInterval in data/useEarthquakes.ts)
- **Fields used:**
  - `features[].properties.mag` — earthquake magnitude (float)
  - `features[].properties.place` — location description string
  - `features[].properties.time` — unix timestamp in milliseconds
  - `features[].properties.url` — USGS event page URL
  - `features[].geometry.coordinates[0]` — longitude
  - `features[].geometry.coordinates[1]` — latitude
  - `features[].geometry.coordinates[2]` — depth in km
- **CORS:** USGS API is CORS-free, verified in past projects (resonate)
- **Fallback:** Embed 5 real earthquake features from today's data as fallback if API fails

## Visual Style
**Preset:** Dark — Ember (volcanic glow), adapted for 3D globe + earthquake rings

**Palette:**
```
const PALETTE = {
  bg: '#0d0a08',           // near-black warm tint
  globe: '#1a1410',        // dark warm grey for globe surface
  ringShallow: '#ff3333',  // bright red — shallow quake (<33km)
  ringMid: '#ff8800',      // amber — mid-depth (33-150km)
  ringDeep: '#66ccff',     // light blue — deep (>150km)
  ringGlow: '#ff5500',     // warm orange glow for all rings
  hero: '#ffab00',         // warm gold for hero number
  text: 'rgba(255,255,255,0.5)',    // chrome text
  stamp: 'rgba(255,255,255,0.35)',  // data stamp
};
```

**Distinct color coding (MANDATORY):**
- Shallow quakes (<33km): bright red (#ff3333) — highest visibility, most dangerous
- Mid-depth (33-150km): amber (#ff8800) — warm, moderate
- Deep (>150km): light blue (#66ccff) — cool tones for depth

**Motion style:** Gentle ambient — globe auto-rotates slowly (0.15 rad/s). Rings expand at speed proportional to magnitude (faster for stronger quakes).

**Coherence:**
- Shape language: thin glowing rings (RingGeometry + MeshBasicMaterial)
- Alpha hierarchy: rings at 0.6-0.9 opacity depending on life cycle phase
- Glow budget: 1 glow color (#ff5500), blur via ring transparency + additive blending
- Accent color: warm gold (#ffab00) for hero number only
- Type scale: one font family (system-ui, sans-serif), max 3 sizes

## Encoding Contract

| Data Field | Visual Channel | Range | Inverse Function | Bigger means... | Legend? |
|---|---|---|---|---|---|
| mag | ring radius | 0.3-2.5 earth radii | radius→mag via linear scale | stronger earthquake | yes (shown in legend) |
| geometry.coordinates[2] (depth) | ring color | shallow=red, mid=amber, deep=blue | n/a (categorical) | deeper quake = cooler color | yes (color legend) |
| mag | ring expansion speed | 0.3-2.0x base speed | speed→mag via linear scale | stronger quake expands faster | no (physical: speed=strength) |
| latitude/longitude | ring position on globe | -90-90 / -180-180 | inverse latlon→globe position | n/a (geographic) | no (globe = map) |

## Required Component Structure (exactly these files)

### src/App.tsx
Canvas → Suspense (fallback: loading spinner) → Background → EarthquakeField → Rings → OrbitControls
Chrome overlay: HeroStats, DataStamp, Description, Legend, QuietZone
All positioned via CSS, no backgrounds, no boxes.

### src/main.tsx
Standard React 18 createRoot. No StrictMode (breaks R3F double-render).

### src/styles.css
Full-screen dark styling. Chrome positions: stamp bottom:20px left:16px, legend bottom:44px center, desc bottom:68px center. No em-dashes.

### src/data/earthquakes.ts
- fetchEarthquakes(): fetches USGS API, returns parsed array of Earthquake objects
- Poll every 60s via setInterval
- Export reusable earthquake type: { id, mag, place, time, depth, lat, lon, url }
- Fallback: embed 5 real earthquake features from Jul 14 data
- lastFetchTime tracking for stamp freshness

### src/components/Background.tsx
Dark warm background (#0d0a08). No stars, no particles — clean dark canvas so rings stand out.

### src/components/EarthquakeField.tsx
Main visual component. Renders a textured Earth sphere (useTexture or MeshBasicMaterial with subtle color), then creates Ring components for each earthquake at their geographic positions. Handles data state from earthquakes.ts.

### src/components/Ring.tsx
Individual earthquake ring. Thin RingGeometry with glowing edge. Animates: expands from zero radius to final (mag-scaled) over ~4s, opacity decays from 0.9 to 0 over ~6s. Color by depth. On click/tap: sets selectedEarthquake for QuietZone.

### src/components/Globe.tsx
A simple sphere (MeshBasicMaterial, no texture) with subtle warm-grey color. Radius = 2 units. Center at origin. Auto-rotates slowly.

### src/components/Chrome.tsx or individual:
- HeroStats.tsx — top-left, 48px warm-gold number showing max magnitude in current batch, label "strongest quake" below at 11px
- DataStamp.tsx — bottom:20px left:16px, "USGS Earthquakes · N events · Mmax X.X · updated Xs ago"
- Description.tsx — bottom:68px center, max-width 65ch, 11px, color rgba(255,255,255,.45)
- Legend.tsx — bottom:44px center, 9px, color rgba(255,255,255,.35). Shows colored dots for shallow/mid/deep + size scale
- QuietZone.tsx — center DOM overlay, activated on tap/click. Shows earthquake detail: magnitude, depth, location, timestamp, source link. Fades after 4s idle

## Interaction
- OrbitControls: drei OrbitControls with enableDamping, minDistance: 3, maxDistance: 15
- Tap/click a ring: QuietZone shows earthquake detail panel + "View on USGS" link (target=_blank)
- No hover-dependent interactions — all work via touch tap
- Touch targets > 44px
- Viewport: `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">`
- DPR: `gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- Reduced motion: frameloop='demand', globe rotation disabled, rings still animate

## Communication Requirements

### Tier 1 (mandatory):
1. **Data Stamp** — "USGS Earthquakes · N events · Mmax X.X · updated Xs ago"
2. **Data Honesty** — fallback labeled "fallback" never "live"
3. **Sensory Mapping** — bigger ring = stronger quake, redder = shallower. Legend explains non-obvious color mapping

### Tier 2 (pick 2 — both required):
4. **Hero Number** — strongest magnitude at 48px top-left, with "strongest quake" label
5. **Quiet Zone** — tap a ring: DOM overlay shows magnitude, depth, location, timestamp, "View on USGS →" link

### Chrome positions (MUST be distinct):
- stamp: bottom:20px left:16px
- legend: bottom:44px center
- desc: bottom:68px center
- hero: top:24px left:24px
- quietZone: center overlay, pointer-events: none on container

## Code Requirements
1. Vite + React + TypeScript + R3F + drei
2. All components in src/ directory per structure above
3. MeshBasicMaterial for rings (no scene lighting, pure color on dark)
4. RingGeometry for earthquake rings (thin, glowing edges, additive blending)
5. MeshBasicMaterial for globe (subtle warm-grey, no texture map)
6. useFrame for ring animation (refs, not state — no setState in useFrame)
7. Zustand store for earthquake data + selected earthquake state
8. First frame: globe visible with rings from fallback data (never blank)
9. Touch guard on click events (pointerEvents to avoid double-fire)
10. No em-dashes in any user-visible strings — use hyphens only
11. system-ui, sans-serif for all chrome text
12. No CDN dependencies, no external fonts
13. .nojekyll file at project root
