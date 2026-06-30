import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/** Deterministik (kareye gore sabit) sozde-rastgele — titreme olmasin diye. */
export const rand = (i: number): number => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ===================== YILDIZLAR (parallax + parilti) ===================== */
export const Stars: React.FC<{
  count?: number;
  scrollY?: number; // parallax kaydirma
  speed?: number;
}> = ({ count = 90, scrollY = 0, speed = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const dots = [];
  for (let i = 0; i < count; i++) {
    const x = rand(i) * width;
    const baseY = rand(i + 99) * height;
    const y = (((baseY + scrollY * (0.3 + rand(i) * 0.7)) % height) + height) % height;
    const r = 1 + rand(i + 7) * 2.2;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.08 * speed + i));
    const big = rand(i + 3) > 0.9;
    dots.push(
      big ? (
        <path
          key={i}
          d={`M${x} ${y - r * 3} L${x + r} ${y} L${x} ${y + r * 3} L${x - r} ${y} Z`}
          fill="#ffe27a"
          opacity={tw}
        />
      ) : (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={tw * 0.9} />
      )
    );
  }
  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${width} ${height}`}
    >
      {dots}
    </svg>
  );
};

/* ===================== DUMAN (yukselen kabaran bulutlar) ===================== */
export const Smoke: React.FC<{
  x: number;
  y: number;
  intensity?: number; // 0..1
  spread?: number;
}> = ({ x, y, intensity = 1, spread = 260 }) => {
  const frame = useCurrentFrame();
  const puffs = [];
  const N = 26;
  for (let i = 0; i < N; i++) {
    const life = ((frame * 0.9 + i * 9) % 90) / 90; // 0..1 dongu
    const px = x + (rand(i) - 0.5) * spread * (0.4 + life);
    const py = y - life * 240 * intensity;
    const rr = (24 + rand(i + 5) * 40) * (0.5 + life) * intensity;
    const op = (1 - life) * 0.55 * intensity;
    const g = 200 - Math.floor(rand(i) * 40);
    puffs.push(
      <circle key={i} cx={px} cy={py} r={rr} fill={`rgb(${g},${g},${g})`} opacity={op} />
    );
  }
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="blurSmoke">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g filter="url(#blurSmoke)">{puffs}</g>
    </svg>
  );
};

/* ===================== ALEV (motor itki ategi) ===================== */
export const Flame: React.FC<{
  x: number;
  y: number;
  scale?: number;
  angle?: number;
}> = ({ x, y, scale = 1, angle = 0 }) => {
  const frame = useCurrentFrame();
  const flick = 1 + Math.sin(frame * 0.9) * 0.12 + Math.sin(frame * 2.3) * 0.06;
  const len = 160 * scale * flick;
  const w = 46 * scale;
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${y}) rotate(${angle})`}>
        <ellipse cx="0" cy={len * 0.45} rx={w * 1.5} ry={len * 0.75} fill="#ff8a1e" opacity={0.55} />
        <path
          d={`M ${-w} 0 Q 0 ${len * 0.5} 0 ${len} Q 0 ${len * 0.5} ${w} 0 Z`}
          fill="#ffb33a"
        />
        <path
          d={`M ${-w * 0.6} 0 Q 0 ${len * 0.45} 0 ${len * 0.78} Q 0 ${len * 0.45} ${w * 0.6} 0 Z`}
          fill="#ffe98a"
        />
      </g>
    </svg>
  );
};

/* ===================== HAREKETLI ALEV (titresen diller + kivilcim) ===================== */
export const AnimatedFlame: React.FC<{
  cx: number; // alevin cikis noktasi (ekran px)
  cy: number;
  scale?: number;
  angle?: number; // 0 = asagi dogru; ucus icin egim ver
  intensity?: number; // 0..1 (kalkista yukselirken artar)
}> = ({ cx, cy, scale = 1, angle = 0, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const tongues = [];
  const N = 7;
  for (let i = 0; i < N; i++) {
    const ph = i * 1.7;
    const flick = 0.65 + 0.35 * Math.sin(frame * 0.8 + ph) + 0.18 * Math.sin(frame * 2.1 + ph);
    const len = (150 + i * 6) * scale * Math.max(0.3, flick) * intensity;
    const w = (30 - i * 2.5) * scale;
    const xoff = (i - (N - 1) / 2) * 10 * scale;
    const colors = ["#fff3b0", "#ffd24a", "#ffae2e", "#ff7a1e", "#e8431e"];
    const c = colors[i % colors.length];
    tongues.push(
      <path
        key={i}
        d={`M ${xoff - w} 0 Q ${xoff} ${len * 0.55} ${xoff} ${len} Q ${xoff} ${len * 0.55} ${xoff + w} 0 Z`}
        fill={c}
        opacity={0.55 + 0.4 * Math.abs(Math.sin(frame * 0.5 + ph))}
      />
    );
  }
  const sparks = [];
  const M = 18;
  for (let i = 0; i < M; i++) {
    const life = ((frame * 1.4 + i * 7) % 60) / 60;
    const y = life * 230 * scale * intensity;
    const x = (rand(i) - 0.5) * 70 * scale + Math.sin(frame * 0.2 + i) * 8;
    const r = (1.5 + rand(i + 3) * 2.5) * scale;
    sparks.push(
      <circle key={`s${i}`} cx={x} cy={y} r={r} fill={rand(i) > 0.5 ? "#ffd24a" : "#ff8a2e"} opacity={(1 - life) * 0.9} />
    );
  }
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "screen", pointerEvents: "none" }}>
      <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
        {tongues}
        {sparks}
      </g>
    </svg>
  );
};

/* ===================== VINYET (kenar karartma — sinematik) ===================== */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);
