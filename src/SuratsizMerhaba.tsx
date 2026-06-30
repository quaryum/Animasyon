import React from "react";
import {
  AbsoluteFill,
  Img,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  continueRender,
  delayRender,
} from "remotion";
import { getAudioData, visualizeAudio, AudioData } from "@remotion/media-utils";

const CHAR = "suratsiz/suratsiz.png"; // seffaf cutout
const VO = "audio/merhaba.mp3";
const CHAR_W = 747;
const CHAR_H = 797;

export const SuratsizMerhaba: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // --- ses + konusma squash ---
  const [audioData, setAudioData] = React.useState<AudioData | null>(null);
  const [handle] = React.useState(() => delayRender("ses"));
  React.useEffect(() => {
    getAudioData(staticFile(VO)).then((d) => {
      setAudioData(d);
      continueRender(handle);
    });
  }, [handle]);

  const VO_START = Math.round(fps * 0.7);
  let talk = 0;
  if (audioData && frame >= VO_START) {
    const bins = visualizeAudio({ fps, frame: frame - VO_START, audioData, numberOfSamples: 16 });
    talk = Math.min(1, (bins.slice(0, 8).reduce((a, b) => a + b, 0) / 8) * 20);
  }

  // --- giris ziplamasi (spring) ---
  const intro = spring({ frame, fps, config: { damping: 9, mass: 0.8 }, durationInFrames: fps });
  const introScale = interpolate(intro, [0, 1], [0.5, 1]);
  const introY = interpolate(intro, [0, 1], [220, 0]);

  // --- selamlama heyecani: ses sirasinda saga-sola sallan + zipla ---
  const greetEnd = VO_START + (audioData ? Math.round(audioData.durationInSeconds * fps) : fps * 3);
  const greeting = frame >= VO_START && frame <= greetEnd;
  const gp = frame - VO_START;
  const rock = greeting ? Math.sin(gp * 0.45) * 6 : Math.sin(frame * 0.06) * 1.2; // derece
  const hop = greeting ? Math.abs(Math.sin(gp * 0.45)) * 22 : 0;

  // --- nefes + konusma squash ---
  const breathe = Math.sin(frame * 0.08) * 0.012;
  const squashY = 1 + breathe - talk * 0.06;
  const squashX = 1 - breathe + talk * 0.05;

  const charDisplayW = width * 0.6;
  const scale = (charDisplayW / CHAR_W) * introScale;

  // --- konusma balonu ---
  const bubbleSpring = spring({ frame: frame - VO_START, fps, config: { damping: 10 }, durationInFrames: fps });
  const bubbleScale = frame >= VO_START ? bubbleSpring : 0;

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #dadade 72%)" }}>
      {/* baslik */}
      <div
        style={{
          position: "absolute",
          top: height * 0.06,
          width: "100%",
          textAlign: "center",
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          fontSize: width * 0.12,
          letterSpacing: width * 0.012,
          color: "#5e3a86",
          opacity: interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        SURATSIZ
      </div>

      {/* yer golgesi */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: height * 0.82 + introY,
          transform: `translateX(-50%) scale(${1 - hop / 200})`,
          width: charDisplayW * 0.7,
          height: charDisplayW * 0.12,
          background: "radial-gradient(ellipse, rgba(80,60,90,0.28), rgba(0,0,0,0) 70%)",
        }}
      />

      {/* karakter */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: height * 0.5 + introY - hop,
          width: CHAR_W * scale,
          height: CHAR_H * scale,
          transform: `translate(-50%, -50%) rotate(${rock}deg) scaleX(${squashX}) scaleY(${squashY})`,
          transformOrigin: "center bottom",
        }}
      >
        <Img src={staticFile(CHAR)} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* konusma balonu */}
      <div
        style={{
          position: "absolute",
          left: "62%",
          top: height * 0.2,
          transform: `scale(${bubbleScale})`,
          transformOrigin: "left bottom",
        }}
      >
        <div
          style={{
            position: "relative",
            background: "#fff",
            border: "5px solid #5e3a86",
            borderRadius: 28,
            padding: "18px 34px",
            fontFamily: "'Comic Sans MS', 'Segoe UI', sans-serif",
            fontWeight: 800,
            fontSize: width * 0.045,
            color: "#5e3a86",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          Merhaba! 👋
          <div
            style={{
              position: "absolute",
              left: -14,
              bottom: 18,
              width: 0,
              height: 0,
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderRight: "18px solid #5e3a86",
            }}
          />
        </div>
      </div>

      <Sequence from={VO_START}>
        <Audio src={staticFile(VO)} />
      </Sequence>
    </AbsoluteFill>
  );
};
