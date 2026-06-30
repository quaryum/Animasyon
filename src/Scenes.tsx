import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from "remotion";
import { Suratsiz } from "./Suratsiz";
import { walkPose, jumpPose, wavePose } from "./animations";

// Ortak sahne: arka plan gradyan + zemin + karakter yuvasi
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(circle at 50% 38%, #ffffff 0%, #d9d9de 70%)",
    }}
  >
    {/* zemin */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "26%",
        background: "linear-gradient(#cfcfd6, #eef0f3)",
      }}
    />
    {children}
  </AbsoluteFill>
);

// Karakteri belirli konuma yerlestiren yardimci
const Actor: React.FC<{
  x: number;
  y?: number;
  size?: number;
  pose: any;
  flip?: boolean;
}> = ({ x, y = 0, size = 460, pose, flip }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      bottom: 120 + y,
      width: size,
      height: size * 1.25,
    }}
  >
    <Suratsiz pose={pose} flip={flip} />
  </div>
);

/* ============ YURUYUS ============ */
export const Yuruyus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  // karakter soldan saga yuruyerek gecer
  const x = interpolate(frame, [0, fps * 6], [-300, width - 100]);
  return (
    <Stage>
      <Actor x={x} pose={walkPose(frame, fps)} />
    </Stage>
  );
};

/* ============ ZIPLAMA ============ */
export const Ziplama: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  return (
    <Stage>
      <Actor x={width / 2 - 230} pose={jumpPose(frame, fps)} />
    </Stage>
  );
};

/* ============ EL SALLAMA ============ */
export const ElSallama: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  return (
    <Stage>
      <Actor x={width / 2 - 230} pose={wavePose(frame, fps)} />
    </Stage>
  );
};

/* ============ 30 SANIYELIK TANITIM ============ */
// Yuruyus -> El sallama -> Ziplama sahnelerini siralar
export const Suratsiz30: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={fps * 10}>
        <Yuruyus />
      </Sequence>
      <Sequence from={fps * 10} durationInFrames={fps * 10}>
        <ElSallama />
      </Sequence>
      <Sequence from={fps * 20} durationInFrames={fps * 10}>
        <Ziplama />
      </Sequence>
    </AbsoluteFill>
  );
};
