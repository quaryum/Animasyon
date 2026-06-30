import { interpolate } from "remotion";
import { Pose, defaultPose } from "./Suratsiz";

const TAU = Math.PI * 2;

/** Nefes alma + goz kirpma — her sahnede arka plan canliligi icin. */
function idle(frame: number, fps: number): Partial<Pose> {
  const t = frame / fps;
  const breathe = Math.sin(t * TAU * 0.5); // yavas nefes
  // her ~2.5 sn'de bir goz kirpma (0.12 sn suren)
  const blinkPhase = (frame % Math.round(fps * 2.5)) / fps;
  const blink = blinkPhase < 0.12 ? Math.sin((blinkPhase / 0.12) * Math.PI) : 0;
  return {
    bodyScaleY: 1 + breathe * 0.01,
    bodyScaleX: 1 - breathe * 0.01,
    blink,
    mouthOpen: 0.35 + 0.05 * Math.sin(t * TAU * 0.7),
  };
}

/** YURUME dongusu: bacaklar ileri-geri, govde hafif yukari-asagi sekme. */
export function walkPose(frame: number, fps: number, speed = 1.6): Pose {
  const t = (frame / fps) * speed;
  const phase = t * TAU;
  const swing = 26; // bacak salinim genisligi
  const bob = Math.abs(Math.sin(phase)) * 10; // her adimda hafif sekme

  return {
    ...defaultPose,
    ...idle(frame, fps),
    bodyY: -bob,
    bodyRot: Math.sin(phase) * 3,
    leftLegRot: Math.sin(phase) * swing,
    rightLegRot: Math.sin(phase + Math.PI) * swing,
    // kollar bacaklarin tersine sallanir
    leftArmRot: Math.sin(phase + Math.PI) * 22,
    rightArmRot: Math.sin(phase) * 22,
    mouthOpen: 0.3,
  };
}

/** ZIPLAMA: cok, squash & stretch ile. Tek dongu icinde anticipation-leap-land. */
export function jumpPose(frame: number, fps: number, cycle = 1.4): Pose {
  const dur = fps * cycle;
  const f = frame % dur;
  const u = f / dur; // 0..1

  let bodyY = 0;
  let sx = 1;
  let sy = 1;
  let armR = 0;
  let legR = 0;

  if (u < 0.18) {
    // anticipation — cokme
    const k = u / 0.18;
    sy = interpolate(k, [0, 1], [1, 0.78]);
    sx = interpolate(k, [0, 1], [1, 1.18]);
    bodyY = interpolate(k, [0, 1], [0, 30]);
    legR = interpolate(k, [0, 1], [0, 18]);
  } else if (u < 0.32) {
    // patlama — yukari firlama (stretch)
    const k = (u - 0.18) / 0.14;
    sy = interpolate(k, [0, 1], [0.78, 1.22]);
    sx = interpolate(k, [0, 1], [1.18, 0.85]);
    bodyY = interpolate(k, [0, 1], [30, -40]);
    armR = interpolate(k, [0, 1], [0, -120]);
    legR = interpolate(k, [0, 1], [18, -20]);
  } else if (u < 0.62) {
    // havada
    const k = (u - 0.32) / 0.3;
    const arc = Math.sin(k * Math.PI);
    bodyY = -40 - arc * 90;
    sy = 1.1;
    sx = 0.92;
    armR = -120;
    legR = -20;
  } else if (u < 0.74) {
    // inis — squash
    const k = (u - 0.62) / 0.12;
    sy = interpolate(k, [0, 1], [1.1, 0.8]);
    sx = interpolate(k, [0, 1], [0.92, 1.16]);
    bodyY = interpolate(k, [0, 1], [-40, 28]);
    armR = interpolate(k, [0, 1], [-120, 10]);
    legR = interpolate(k, [0, 1], [-20, 16]);
  } else {
    // toparlanma
    const k = (u - 0.74) / 0.26;
    sy = interpolate(k, [0, 1], [0.8, 1]);
    sx = interpolate(k, [0, 1], [1.16, 1]);
    bodyY = interpolate(k, [0, 1], [28, 0]);
    armR = interpolate(k, [0, 1], [10, 0]);
    legR = interpolate(k, [0, 1], [16, 0]);
  }

  return {
    ...defaultPose,
    ...idle(frame, fps),
    bodyY,
    bodyScaleX: sx,
    bodyScaleY: sy,
    leftArmRot: armR,
    rightArmRot: armR,
    leftLegRot: legR,
    rightLegRot: legR,
    mouthOpen: interpolate(bodyY, [-130, 30], [0.9, 0.2], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };
}

/** EL SALLAMA: sag kol yukari kalkar ve sallanir. */
export function wavePose(frame: number, fps: number): Pose {
  const t = frame / fps;
  // kolu kaldirma (ilk 0.4 sn)
  const raise = interpolate(t, [0, 0.4], [0, -135], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wave = Math.sin(t * TAU * 2.2) * 18; // hizli sallama

  return {
    ...defaultPose,
    ...idle(frame, fps),
    rightArmRot: raise + wave,
    headRot: Math.sin(t * TAU * 1.1) * 3,
    bodyRot: Math.sin(t * TAU * 1.1) * 1.5,
    mouthOpen: 0.55 + 0.2 * Math.abs(Math.sin(t * TAU * 1.1)),
  };
}
