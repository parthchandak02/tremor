import { PALETTE } from '../types'

export default function Legend() {
  return (
    <div className="legend">
      <span className="legend__item">
        <span className="legend__dot" style={{ background: PALETTE.ringShallow }} />
        shallow &lt;33km
      </span>
      <span className="legend__item">
        <span className="legend__dot" style={{ background: PALETTE.ringMid }} />
        mid 33-150km
      </span>
      <span className="legend__item">
        <span className="legend__dot" style={{ background: PALETTE.ringDeep }} />
        deep &gt;150km
      </span>
      <span className="legend__sep">|</span>
      <span className="legend__item">ring size = magnitude</span>
    </div>
  )
}
