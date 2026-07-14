# tremor

A 3D globe showing live USGS earthquakes as glowing ring arcs. Each earthquake's magnitude controls ring size and expansion speed, while depth determines color (red = shallow, amber = mid, blue = deep). Orbit the globe freely and tap any ring for earthquake details.

**Visual Style:** Dark — Ember (volcanic glow) — deep warm background, red/amber/blue rings, gold hero number

**Data Source:** USGS Earthquake Catalog API (CORS-free, real-time)

**How it works:**
- Earthquakes appear as glowing ring arcs at their exact geographic positions on a rotating 3D globe
- Ring radius scales with magnitude (0.3 to 2.5 globe radii)
- Ring color encodes depth: red (<33km shallow), amber (33-150km mid), blue (>150km deep)
- Hero number shows the strongest quake magnitude in the current batch
- Tap a ring to reveal a detail panel with magnitude, depth, location, and a link to the USGS event page
- The data stamp shows source, event count, live/fallback status, and time since last update

**GitHub:** https://github.com/parthchandak02/tremor

**Live:** https://tremor.parthchandak.info

**Tech:** React Three Fiber + drei. Hosted on Cloudflare Pages.
