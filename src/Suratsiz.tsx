import React from "react";

/**
 * SURATSIZ — parcalara ayrilmis (rigged) 2D karakter.
 *
 * Her uzuv kendi pivot noktasi etrafinda doner. Animasyon yapmak icin
 * sahnelerden bu bilesene `pose` gonderilir. Kendi Adobe Illustrator
 * cizimini kullanmak istersen: SVG olarak disa aktar, parcalari ayni
 * <g> gruplarina (kol, bacak, kafa...) yerlestir ve ayni pivotlari kullan.
 */

export type Pose = {
  // Tum govdenin konumu/olcegi (ziplama, squash & stretch icin)
  bodyX: number;
  bodyY: number;
  bodyScaleX: number;
  bodyScaleY: number;
  bodyRot: number;
  // Uzuv acilari (derece)
  leftArmRot: number;
  rightArmRot: number;
  leftLegRot: number;
  rightLegRot: number;
  headRot: number;
  // Yuz
  blink: number; // 0 = acik, 1 = kapali
  mouthOpen: number; // 0..1
};

export const defaultPose: Pose = {
  bodyX: 0,
  bodyY: 0,
  bodyScaleX: 1,
  bodyScaleY: 1,
  bodyRot: 0,
  leftArmRot: 0,
  rightArmRot: 0,
  leftLegRot: 0,
  rightLegRot: 0,
  headRot: 0,
  blink: 0,
  mouthOpen: 0.4,
};

// Renkler (gorseldeki paletten)
const C = {
  body: "#6b3f8f",
  bodyDark: "#532f70",
  bodyLight: "#8a5aad",
  belly: "#f2c81e",
  strap: "#1bb6a6",
  hornDark: "#4a2a66",
  hornLight: "#b79fce",
  eyeWhite: "#f4f0f7",
  iris: "#3f8f5a",
  mouth: "#3a1530",
  tongue: "#e8643f",
};

export const Suratsiz: React.FC<{ pose?: Partial<Pose>; flip?: boolean }> = ({
  pose,
  flip = false,
}) => {
  const p: Pose = { ...defaultPose, ...pose };

  // Pivot noktalari (omuz / kalca / boyun)
  const PIV = {
    leftShoulder: { x: 118, y: 250 },
    rightShoulder: { x: 282, y: 250 },
    leftHip: { x: 168, y: 360 },
    rightHip: { x: 232, y: 360 },
    neck: { x: 200, y: 200 },
  };

  const eyeScaleY = 1 - 0.85 * p.blink;

  return (
    <svg
      viewBox="0 0 400 500"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      <g
        transform={`translate(${p.bodyX} ${p.bodyY}) rotate(${p.bodyRot} 200 280) scale(${
          flip ? -p.bodyScaleX : p.bodyScaleX
        } ${p.bodyScaleY})`}
        style={{ transformBox: "fill-box" }}
      >
        {/* translate origin duzeltmesi flip icin */}
        <g transform={flip ? "translate(400 0)" : ""}>
          {/* ===== ARKA BACAKLAR / KOLLAR (govde arkasi) ===== */}

          {/* SOL KOL */}
          <g transform={`rotate(${p.leftArmRot} ${PIV.leftShoulder.x} ${PIV.leftShoulder.y})`}>
            <path
              d="M118 248 q-46 6 -52 56 q-2 26 16 40 q14 8 22 -6 q-10 -18 -2 -40 q6 -22 24 -30 Z"
              fill={C.bodyDark}
            />
            <ellipse cx="92" cy="346" rx="16" ry="14" fill={C.bodyDark} />
          </g>

          {/* SAG KOL */}
          <g transform={`rotate(${p.rightArmRot} ${PIV.rightShoulder.x} ${PIV.rightShoulder.y})`}>
            <path
              d="M282 248 q46 6 52 56 q2 26 -16 40 q-14 8 -22 -6 q10 -18 2 -40 q-6 -22 -24 -30 Z"
              fill={C.bodyDark}
            />
            <ellipse cx="308" cy="346" rx="16" ry="14" fill={C.bodyDark} />
          </g>

          {/* SOL BACAK */}
          <g transform={`rotate(${p.leftLegRot} ${PIV.leftHip.x} ${PIV.leftHip.y})`}>
            <rect x="150" y="350" width="34" height="70" rx="16" fill={C.body} />
            <rect x="150" y="362" width="34" height="10" fill={C.strap} />
            <rect x="150" y="378" width="34" height="8" fill={C.belly} />
            {/* ayak */}
            <ellipse cx="158" cy="430" rx="42" ry="20" fill={C.bodyDark} />
            <ellipse cx="170" cy="426" rx="14" ry="8" fill={C.bodyLight} opacity="0.5" />
          </g>

          {/* SAG BACAK */}
          <g transform={`rotate(${p.rightLegRot} ${PIV.rightHip.x} ${PIV.rightHip.y})`}>
            <rect x="216" y="350" width="34" height="70" rx="16" fill={C.body} />
            <rect x="216" y="362" width="34" height="10" fill={C.strap} />
            <rect x="216" y="378" width="34" height="8" fill={C.belly} />
            <ellipse cx="242" cy="430" rx="42" ry="20" fill={C.bodyDark} />
            <ellipse cx="232" cy="426" rx="14" ry="8" fill={C.bodyLight} opacity="0.5" />
          </g>

          {/* ===== GOVDE ===== */}
          <g transform={`rotate(${p.headRot} ${PIV.neck.x} ${PIV.neck.y})`}>
            {/* boynuzlar */}
            <g>
              <path d="M150 150 q-40 -40 -34 -96 q22 14 30 40 q8 28 18 44 Z" fill={C.hornDark} />
              <path d="M124 80 l10 6 M132 104 l10 6 M142 126 l10 5" stroke={C.hornLight} strokeWidth="6" strokeLinecap="round" />
              <path d="M250 150 q40 -40 34 -96 q-22 14 -30 40 q-8 28 -18 44 Z" fill={C.hornDark} />
              <path d="M276 80 l-10 6 M268 104 l-10 6 M258 126 l-10 5" stroke={C.hornLight} strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* ana govde */}
            <ellipse cx="200" cy="250" rx="118" ry="125" fill={C.body} />
            {/* govde golge */}
            <ellipse cx="230" cy="270" rx="92" ry="100" fill={C.bodyDark} opacity="0.18" />

            {/* karin (sari) */}
            <path
              d="M104 300 a96 70 0 0 0 192 0 q0 -10 -4 -18 a96 60 0 0 1 -184 0 q-4 8 -4 18 Z"
              fill={C.belly}
            />
            {/* askilar */}
            <path d="M150 188 q-30 70 -40 120" stroke={C.strap} strokeWidth="11" fill="none" />
            <path d="M250 188 q30 70 40 120" stroke={C.strap} strokeWidth="11" fill="none" />
            <path d="M104 300 q96 34 192 0" stroke={C.strap} strokeWidth="9" fill="none" />

            {/* ===== YUZ ===== */}
            {/* goz torbasi */}
            <ellipse cx="200" cy="225" rx="78" ry="46" fill={C.bodyDark} opacity="0.55" />

            {/* gozler */}
            <g transform={`translate(0 ${1 - eyeScaleY ? 0 : 0})`}>
              <g transform={`translate(168 226) scale(1 ${eyeScaleY})`}>
                <ellipse cx="0" cy="0" rx="30" ry="34" fill={C.eyeWhite} />
                <ellipse cx="2" cy="8" rx="13" ry="15" fill="#3f8f5a" />
                <circle cx="2" cy="8" r="6" fill="#1a1a1a" />
                <circle cx="-3" cy="2" r="4" fill="#fff" />
              </g>
              <g transform={`translate(232 226) scale(1 ${eyeScaleY})`}>
                <ellipse cx="0" cy="0" rx="30" ry="34" fill={C.eyeWhite} />
                <ellipse cx="2" cy="8" rx="13" ry="15" fill="#3f8f5a" />
                <circle cx="2" cy="8" r="6" fill="#1a1a1a" />
                <circle cx="-3" cy="2" r="4" fill="#fff" />
              </g>
              {/* ust goz kapagi (uykulu bakis) */}
              <path d="M138 214 q30 -16 60 0 Z" fill={C.body} />
              <path d="M202 214 q30 -16 60 0 Z" fill={C.body} />
            </g>

            {/* agiz */}
            <g transform={`translate(200 300)`}>
              <ellipse cx="0" cy="0" rx={16} ry={6 + 16 * p.mouthOpen} fill={C.mouth} />
              <ellipse cx="0" cy={6 + 8 * p.mouthOpen} rx={11} ry={4 + 6 * p.mouthOpen} fill={C.tongue} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
