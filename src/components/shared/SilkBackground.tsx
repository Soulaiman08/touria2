'use client'

export function SilkBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Base warm Cedar Espresso dark layer */}
      <div style={{ position: 'absolute', inset: 0, background: '#140D09' }} />

      {/* Wave 1 — Fez terracotta main silk folds */}
      <div
        className="silk-wave-1 silk-layer"
        style={{
          position: 'absolute',
          inset: '-40%',
          width: '180%',
          height: '180%',
          backgroundImage:
            'radial-gradient(ellipse 55% 40% at 25% 35%, rgba(184,84,40,0.68) 0%, rgba(154,68,30,0.48) 32%, rgba(92,42,20,0.24) 58%, transparent 76%),' +
            'radial-gradient(ellipse 55% 40% at 75% 30%, rgba(217,122,74,0.52) 0%, rgba(184,84,40,0.36) 32%, rgba(92,42,20,0.2) 56%, transparent 75%),' +
            'radial-gradient(ellipse 50% 45% at 50% 72%, rgba(154,68,30,0.6) 0%, rgba(120,52,24,0.38) 32%, rgba(72,32,16,0.18) 58%, transparent 75%)',
          willChange: 'transform',
        }}
      />

      {/* Wave 2 — Antique brass secondary folds */}
      <div
        className="silk-wave-2 silk-layer"
        style={{
          position: 'absolute',
          inset: '-40%',
          width: '180%',
          height: '180%',
          backgroundImage:
            'radial-gradient(ellipse 50% 35% at 70% 65%, rgba(166,130,70,0.45) 0%, rgba(140,108,56,0.3) 32%, rgba(90,68,36,0.16) 56%, transparent 75%),' +
            'radial-gradient(ellipse 50% 35% at 20% 65%, rgba(212,174,120,0.35) 0%, rgba(166,130,70,0.24) 32%, rgba(90,68,36,0.14) 56%, transparent 75%),' +
            'radial-gradient(ellipse 55% 40% at 45% 15%, rgba(166,130,70,0.42) 0%, rgba(132,100,52,0.26) 32%, rgba(82,62,32,0.14) 56%, transparent 75%)',
          willChange: 'transform',
        }}
      />

      {/* Wave 3 — Warm gold-limestone shimmer */}
      <div
        className="silk-wave-3 silk-layer"
        style={{
          position: 'absolute',
          inset: '-25%',
          width: '150%',
          height: '150%',
          backgroundImage:
            'radial-gradient(ellipse 45% 30% at 35% 45%, rgba(212,174,120,0.28) 0%, rgba(166,130,70,0.18) 36%, rgba(100,76,42,0.08) 62%, transparent 74%),' +
            'radial-gradient(ellipse 40% 30% at 65% 55%, rgba(217,122,74,0.24) 0%, rgba(184,84,40,0.14) 36%, rgba(92,42,20,0.08) 62%, transparent 74%)',
          willChange: 'transform',
        }}
      />

      {/* Noise texture overlay for silk feel */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      <style>{`
        @media (max-width: 768px) {
          .silk-layer { display: none !important; }
        }
        @media (min-width: 769px) {
          .silk-wave-1 {
            animation: silkDrift1 12s ease-in-out infinite alternate;
          }
          .silk-wave-2 {
            animation: silkDrift2 15s ease-in-out infinite alternate;
          }
          .silk-wave-3 {
            animation: silkDrift3 10s ease-in-out infinite alternate;
          }
          @keyframes silkDrift1 {
            0% { transform: translate(-6%, -4%) rotate(-2deg) scale(1); }
            100% { transform: translate(18%, 12%) rotate(5deg) scale(1.1); }
          }
          @keyframes silkDrift2 {
            0% { transform: translate(6%, 4%) rotate(2deg) scale(1); }
            100% { transform: translate(-14%, -9%) rotate(-4deg) scale(1.12); }
          }
          @keyframes silkDrift3 {
            0% { transform: translate(-4%, 3%) scale(1); }
            100% { transform: translate(12%, -8%) scale(1.15); }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .silk-wave-1, .silk-wave-2, .silk-wave-3 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}