import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { Stars, Smoke, Vignette, AnimatedFlame, rand } from "./FX";

/**
 * ROKET KALKIS — gercek JPG gorsellerle 2.5D sinematik montaj.
 * Sahneler: pad -> kalkis -> ucus -> pencere. Her birine kamera (Ken Burns),
 * sarsinti, alev parlamasi, ek yildiz parlitisi ve crossfade uygulanir.
 */
const IMG = {
  pad: "roket/pad.jpeg",
  kalkis: "roket/kalkis.jpeg",
  ucus: "roket/ucus.jpeg",
  pencere: "roket/pencere.jpeg",
};

const shake = (frame: number, amp: number) => ({
  x: (rand(frame) - 0.5) * amp,
  y: (rand(frame + 50) - 0.5) * amp,
});

// arka plan gorseli + kamera donusumu
const Bg: React.FC<{ src: string; scale: number; x?: number; y?: number; rot?: number }> = ({
  src,
  scale,
  x = 0,
  y = 0,
  rot = 0,
}) => (
  <Img
    src={staticFile(src)}
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rot}deg)`,
      transformOrigin: "center center",
    }}
  />
);

// motor parlamasi (gorseldeki aleve canlilik katan radyal isik)
const Glow: React.FC<{ cx: string; cy: string; size: number; pulse?: number; color?: string }> = ({
  cx,
  cy,
  size,
  pulse = 1,
  color = "255,180,60",
}) => {
  const frame = useCurrentFrame();
  const flick = 0.7 + 0.3 * Math.abs(Math.sin(frame * 0.7) + 0.4 * Math.sin(frame * 1.9));
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: size,
          height: size,
          transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle, rgba(${color},${0.55 * pulse * flick}) 0%, rgba(${color},0) 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ek parlayan yildizlar (gokyuzune binen, screen blend)
const Twinkle: React.FC<{ count?: number }> = ({ count = 40 }) => (
  <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
    <Stars count={count} speed={1.4} />
  </AbsoluteFill>
);

/* ============ SAHNE 1: RAMPA (push-in + motor uyaniyor) ============ */
const Pad: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const RUMBLE = fps * 2.2;
  const scale = interpolate(frame, [0, fps * 4], [1.0, 1.09], { extrapolateRight: "clamp" });
  const amp = interpolate(frame, [RUMBLE, fps * 4], [0, 9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sh = shake(frame, amp);
  const glowP = interpolate(frame, [RUMBLE, fps * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const smokeInt = interpolate(frame, [RUMBLE + 6, fps * 4], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0b1c3a", overflow: "hidden" }}>
      <Bg src={IMG.pad} scale={scale} x={sh.x} y={sh.y} />
      <Twinkle count={28} />
      <Glow cx="50%" cy="74%" size={width * 0.35} pulse={glowP} />
      {glowP > 0 && (
        <AnimatedFlame cx={width / 2 + sh.x} cy={height * 0.86 + sh.y} scale={0.7 * glowP} intensity={glowP} />
      )}
      {smokeInt > 0 && <Smoke x={width / 2} y={height * 0.92} intensity={smokeInt} spread={width * 0.4} />}
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

/* ============ SAHNE 2: KALKIS (guclu sarsinti + alev + tirmanis) ============ */
const Kalkis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const amp = interpolate(frame, [0, fps * 1.5, fps * 4], [16, 6, 2], { extrapolateRight: "clamp" });
  const sh = shake(frame, amp);
  const scale = interpolate(frame, [0, fps * 5], [1.04, 1.16], { extrapolateRight: "clamp" });
  // hafif yukari tirmanis hissi (gorsel asagi kayar)
  const climb = interpolate(frame, [0, fps * 5], [0, 26], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0b1c3a", overflow: "hidden" }}>
      <Bg src={IMG.kalkis} scale={scale} x={sh.x} y={sh.y + climb} />
      <Twinkle count={30} />
      {/* alev plumu canlandirma */}
      <Glow cx="50%" cy="84%" size={width * 0.5} pulse={1.1} color="255,170,40" />
      <Glow cx="50%" cy="92%" size={width * 0.7} pulse={0.8} color="255,120,30" />
      <AnimatedFlame cx={width / 2 + sh.x} cy={height * 0.62 + sh.y + climb} scale={1.5} intensity={1} />
      <Smoke x={width / 2} y={height * 1.02} intensity={1} spread={width * 0.55} />
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};

/* ============ SAHNE 3: UZAYDA UCUS (diyagonal Ken Burns) ============ */
const Ucus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // kamera roketi takip eder: sag-yukari dogru kayar, hafif zoom out
  const scale = interpolate(frame, [0, fps * 5], [1.14, 1.05], { extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, fps * 5], [50, -50], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, fps * 5], [40, -40], { extrapolateRight: "clamp" });
  const rot = Math.sin(frame * 0.04) * 0.8;
  return (
    <AbsoluteFill style={{ background: "#0b1c3a", overflow: "hidden" }}>
      <Bg src={IMG.ucus} scale={scale} x={x} y={y} rot={rot} />
      <Twinkle count={45} />
      {/* motor alevi sol-altta, egik */}
      <Glow cx="27%" cy="74%" size={width * 0.22} pulse={1.1} color="255,160,40" />
      <AnimatedFlame cx={width * 0.29 + x} cy={height * 0.7 + y} scale={0.85} angle={38} intensity={1} />
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};

/* ============ SAHNE 4: PENCEREDEN KOY (uzaklasan zoom-out) ============ */
const Pencere: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = interpolate(frame, [0, fps * 4], [1.16, 1.0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const x = interpolate(frame, [0, fps * 4], [20, -20]);
  return (
    <AbsoluteFill style={{ background: "#06122a", overflow: "hidden" }}>
      <Bg src={IMG.pencere} scale={scale} x={x} />
      <Twinkle count={22} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

/* ============ MONTAJ ============ */
const FadeIn: React.FC<{ children: React.ReactNode; dur?: number }> = ({ children, dur = 18 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

export const RoketKalkis: React.FC = () => {
  const { fps } = useVideoConfig();
  const d1 = fps * 4; // pad
  const d2 = fps * 5; // kalkis
  const d3 = fps * 5; // ucus
  const d4 = fps * 4; // pencere
  const ov = 18;

  let t = 0;
  const s1 = t;
  t += d1;
  const s2 = t - ov;
  t += d2 - ov;
  const s3 = t;
  t += d3 - ov;
  const s4 = t;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={s1} durationInFrames={d1}>
        <Pad />
      </Sequence>
      <Sequence from={s2} durationInFrames={d2 + ov}>
        <FadeIn>
          <Kalkis />
        </FadeIn>
      </Sequence>
      <Sequence from={s3} durationInFrames={d3 + ov}>
        <FadeIn>
          <Ucus />
        </FadeIn>
      </Sequence>
      <Sequence from={s4} durationInFrames={d4 + ov}>
        <FadeIn>
          <Pencere />
        </FadeIn>
      </Sequence>

      {/* ===== SES ===== */}
      {/* arka plan muzigi */}
      <Audio src={staticFile("audio/music.wav")} volume={0.32} />
      {/* kalkis gumburtusu (rampa + kalkis boyunca) */}
      <Sequence from={0} durationInFrames={fps * 9}>
        <Audio src={staticFile("audio/rumble.wav")} volume={0.5} />
      </Sequence>
      {/* kalkis ani whoosh */}
      <Sequence from={Math.round(fps * 3.9)}>
        <Audio src={staticFile("audio/whoosh.wav")} volume={0.6} />
      </Sequence>
      {/* Turkce anlatim */}
      <Sequence from={Math.round(fps * 0.4)}>
        <Audio src={staticFile("audio/vo1.mp3")} volume={1} />
      </Sequence>
      <Sequence from={Math.round(fps * 3.3)}>
        <Audio src={staticFile("audio/vo2.mp3")} volume={1} />
      </Sequence>
      <Sequence from={Math.round(fps * 9.2)}>
        <Audio src={staticFile("audio/vo3.mp3")} volume={1} />
      </Sequence>
      <Sequence from={Math.round(fps * 14.3)}>
        <Audio src={staticFile("audio/vo4.mp3")} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};
