import React from "react";
import { AbsoluteFill } from "remotion";

/**
 * TASLAK gorseller — sadece gercek JPG'ler gelene kadar.
 * Gercek dosyalar assets/roket'e konunca RoketKalkis.tsx icindeki
 * IMAGES tablosuna dosya adlarini yaz, bunlarin yerine onlar gecer.
 */

const NIGHT = "linear-gradient(#0b1c3a, #14264d 60%, #1c2f57)";

// Basit cizilmis roket (taslak)
export const RocketShape: React.FC<{ width?: number }> = ({ width = 220 }) => (
  <svg width={width} height={width * 2.4} viewBox="0 0 100 240">
    {/* govde */}
    <path d="M50 4 C70 28 74 70 74 120 L74 180 L26 180 L26 120 C26 70 30 28 50 4 Z" fill="#e9d9a8" stroke="#111" strokeWidth="2.5" />
    {/* burun */}
    <path d="M50 4 C62 24 68 50 70 78 L30 78 C32 50 38 24 50 4 Z" fill="#d9442c" stroke="#111" strokeWidth="2.5" />
    {/* pencere */}
    <circle cx="50" cy="108" r="20" fill="#1b3b6b" stroke="#111" strokeWidth="2.5" />
    <circle cx="44" cy="102" r="6" fill="#5b86c4" opacity="0.7" />
    {/* kanatlar */}
    <path d="M26 130 C6 150 4 178 10 196 L26 178 Z" fill="#d9442c" stroke="#111" strokeWidth="2.5" />
    <path d="M74 130 C94 150 96 178 90 196 L74 178 Z" fill="#d9442c" stroke="#111" strokeWidth="2.5" />
    {/* alt halka */}
    <rect x="26" y="176" width="48" height="14" rx="4" fill="#2b3b5e" stroke="#111" strokeWidth="2.5" />
    {/* itki cikisi */}
    <path d="M40 190 L60 190 L55 206 L45 206 Z" fill="#d9442c" stroke="#111" strokeWidth="2" />
  </svg>
);

// Sahne A taslagi: gece gokyuzu + zemin (roket ayri katman olarak ustte gelir)
export const PadBg: React.FC = () => (
  <AbsoluteFill style={{ background: NIGHT }}>
    <div style={{ position: "absolute", bottom: 0, width: "100%", height: "18%", background: "#0a162e" }} />
    <div style={{ position: "absolute", bottom: "17%", width: "100%", height: 4, background: "#22376a" }} />
  </AbsoluteFill>
);

// Sahne B taslagi: uzay
export const SpaceBg: React.FC = () => (
  <AbsoluteFill style={{ background: NIGHT }} />
);

// Sahne C taslagi: yuvarlak pencereden koy manzarasi
export const WindowBg: React.FC = () => (
  <AbsoluteFill style={{ background: "#0b1c3a" }}>
    {/* manzara */}
    <AbsoluteFill style={{ background: "linear-gradient(#16315f, #1e4a3a)" }}>
      {/* tepeler */}
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <path d="M0 620 Q480 520 960 600 T1920 580 L1920 1080 L0 1080 Z" fill="#15402f" />
        {/* evler */}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = 180 + i * 130 + (i % 2) * 40;
          const y = 720 + (i % 3) * 50;
          return (
            <g key={i}>
              <rect x={x} y={y} width="70" height="60" fill="#1f3d63" stroke="#0a1830" strokeWidth="3" />
              <path d={`M${x - 8} ${y} L${x + 35} ${y - 28} L${x + 78} ${y} Z`} fill="#27568a" stroke="#0a1830" strokeWidth="3" />
              <rect x={x + 12} y={y + 18} width="16" height="20" fill="#ffd24a" />
              <rect x={x + 42} y={y + 18} width="16" height="20" fill="#ffd24a" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
    {/* pencere maskesi (kenar halkalari) */}
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 38%, #0b3a52 39%, #0b3a52 42%, #0a2740 44%, #071a30 47%, #06122a 50%, #06122a 100%)",
      }}
    />
  </AbsoluteFill>
);
