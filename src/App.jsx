import { useState, useCallback, useEffect, useRef } from 'react';
import AIVoiceAssistant from './components/AIVoiceAssistant';

const HINT_STYLES = `
  @keyframes hint-floatin {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0px); }
  }
  @keyframes hint-bob {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-5px); }
  }
  @keyframes hint-fadeout {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
`;

export default function App() {
  const [dismissed, setDismissed] = useState(false);
  const [gone, setGone] = useState(false);
  const goneTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (goneTimerRef.current) clearTimeout(goneTimerRef.current); };
  }, []);

  const handleFirstHit = useCallback(() => {
    setDismissed(true);
    goneTimerRef.current = setTimeout(() => setGone(true), 600);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh' }}>
      <style>{HINT_STYLES}</style>

      <AIVoiceAssistant
        scale={1.2}
        animationSpeed={1}
        enableMouseTracking={true}
        onFirstHit={handleFirstHit}
        style={{ width: '100%', height: '100%' }}
      />

      {!gone && (
        <div
          style={{
            position: 'absolute',
            bottom: '28%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: dismissed
              ? 'hint-fadeout 0.4s ease forwards'
              : 'hint-floatin 0.6s 2s ease both',
          }}
        >
          {/* Notch pointing up toward the sphere */}
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '7px solid rgba(0, 229, 255, 0.18)',
            marginBottom: '-1px',
            filter: 'drop-shadow(0 -1px 3px rgba(0,229,255,0.12))',
          }} />

          {/* Speech bubble pill */}
          <div
            style={{
              background: 'rgba(0, 229, 255, 0.06)',
              border: '1px solid rgba(0, 229, 255, 0.18)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '20px',
              padding: '7px 18px',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.07), inset 0 0 12px rgba(0,229,255,0.03)',
              animation: dismissed ? 'none' : 'hint-bob 3s 2.6s ease-in-out infinite',
            }}
          >
            <span style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(0, 229, 255, 0.75)',
              textShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
              whiteSpace: 'nowrap',
            }}>
              click me
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
