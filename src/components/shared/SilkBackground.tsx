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
      {/* Base dark layer */}
      <div style={{ position: 'absolute', inset: 0, background: '#0d0f11' }} />

      {/* Wave 1 — bronze main folds (3 crests, solid cores) */}
      <div
        className="silk-wave-1 silk-layer"
        style={{
          position: 'absolute',
          inset: '-40%',
          width: '180%',
          height: '180%',
          backgroundImage:
            'radial-gradient(ellipse 55% 40% at 25% 35%, rgb(176,80,34) 0%, rgba(176,80,34,0.85) 30%, rgba(130,60,25,0.45) 55%, transparent 75%),' +
            'radial-gradient(ellipse 55% 40% at 75% 30%, rgb(196,98,45) 0%, rgba(176,80,34,0.85) 30%, rgba(120,55,25,0.40) 55%, transparent 75%),' +
            'radial-gradient(ellipse 50% 45% at 50% 70%, rgb(160,75,32) 0%, rgba(160,75,32,0.80) 30%, rgba(110,50,20,0.35) 55%, transparent 75%)',
          willChange: 'transform',
        }}
      />

      {/* Wave 2 — gold secondary folds (3 crests, solid cores) */}
      <div
        className="silk-wave-2 silk-layer"
        style={{
          position: 'absolute',
          inset: '-40%',
          width: '180%',
          height: '180%',
          backgroundImage:
            'radial-gradient(ellipse 50% 35% at 70% 65%, rgb(184,150,90) 0%, rgba(174,138,80,0.85) 30%, rgba(130,100,55,0.45) 55%, transparent 75%),' +
            'radial-gradient(ellipse 50% 35% at 20% 65%, rgb(168,132,75) 0%, rgba(158,122,68,0.80) 30%, rgba(115,85,45,0.40) 55%, transparent 75%),' +
            'radial-gradient(ellipse 55% 40% at 45% 15%, rgb(178,142,84) 0%, rgba(168,130,76,0.80) 30%, rgba(105,80,42,0.35) 55%, transparent 75%)',
          willChange: 'transform',
        }}
      />

      {/* Wave 3 — golden shimmer (2 crests, solid cores) */}
      <div
        className="silk-wave-3 silk-layer"
        style={{
          position: 'absolute',
          inset: '-25%',
          width: '150%',
          height: '150%',
          backgroundImage:
            'radial-gradient(ellipse 45% 30% at 35% 45%, rgb(212,174,120) 0%, rgba(204,164,110,0.85) 35%, rgba(155,120,72,0.40) 60%, transparent 72%),' +
            'radial-gradient(ellipse 40% 30% at 65% 55%, rgb(222,186,134) 0%, rgba(212,174,120,0.85) 35%, rgba(148,112,66,0.35) 60%, transparent 72%)',
          willChange: 'transform',
        }}
      />

      {/* Noise texture overlay for silk feel */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
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
            animation: silkDrift1 10s ease-in-out infinite alternate;
          }
          .silk-wave-2 {
            animation: silkDrift2 13s ease-in-out infinite alternate;
          }
          .silk-wave-3 {
            animation: silkDrift3 9s ease-in-out infinite alternate;
          }
          @keyframes silkDrift1 {
            0% { transform: translate(-6%, -4%) rotate(-2deg) scale(1); }
            100% { transform: translate(20%, 14%) rotate(6deg) scale(1.12); }
          }
          @keyframes silkDrift2 {
            0% { transform: translate(6%, 4%) rotate(2deg) scale(1); }
            100% { transform: translate(-16%, -10%) rotate(-4deg) scale(1.14); }
          }
          @keyframes silkDrift3 {
            0% { transform: translate(-4%, 3%) scale(1); }
            100% { transform: translate(15%, -9%) scale(1.18); }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .silk-wave-1, .silk-wave-2, .silk-wave-3 {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}