import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  continueRender,
  delayRender,
} from "remotion";
import { getAudioData, visualizeAudio, AudioData } from "@remotion/media-utils";
import { Suratsiz } from "./Suratsiz";
import { wavePose } from "./animations";

/**
 * KONUSMA sahnesi — sesli anlatim + OTOMATIK agiz senkronu (lip-sync).
 * Sesin o anki yuksekligi olculup karakterin mouthOpen degerine baglanir.
 * El ile kare kare ugrasmaya gerek yok.
 */
const SRC = "audio/ses-test.mp3";

export const Konusma: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const [audioData, setAudioData] = React.useState<AudioData | null>(null);
  const [handle] = React.useState(() => delayRender("ses yukleniyor"));

  React.useEffect(() => {
    getAudioData(staticFile(SRC)).then((d) => {
      setAudioData(d);
      continueRender(handle);
    });
  }, [handle]);

  // Sesin frekans bantlarini al, ortalama yukseklikten agiz aciklik degeri uret
  let mouth = 0.15;
  if (audioData) {
    const bins = visualizeAudio({ fps, frame, audioData, numberOfSamples: 16 });
    const amp = bins.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
    mouth = Math.min(1, Math.max(0.08, amp * 22));
  }

  // konusurken hafif el sallama + nefes (wavePose'dan alip agzi sesle ezelim)
  const base = wavePose(frame, fps);

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 38%, #ffffff 0%, #d9d9de 70%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "26%",
          background: "linear-gradient(#cfcfd6, #eef0f3)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: width / 2 - 230,
          bottom: 120,
          width: 460,
          height: 460 * 1.25,
        }}
      >
        <Suratsiz pose={{ ...base, mouthOpen: mouth }} />
      </div>
      <Audio src={staticFile(SRC)} />
    </AbsoluteFill>
  );
};
