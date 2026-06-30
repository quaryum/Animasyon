import React from "react";
import { Composition, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Yuruyus, Ziplama, ElSallama, Suratsiz30 } from "./Scenes";
import { Konusma } from "./Konusma";
import { RoketKalkis } from "./roket/RoketKalkis";
import { SuratsizMerhaba } from "./SuratsizMerhaba";

const FPS = 30;
const W = 1080;
const H = 1350; // 4:5 dikey (gorseldeki oran). Yatay icin 1920x1080 yap.

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Tek tek test edebilecegin sahneler */}
      <Composition
        id="Yuruyus"
        component={Yuruyus}
        durationInFrames={FPS * 6}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Ziplama"
        component={Ziplama}
        durationInFrames={FPS * 4}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="ElSallama"
        component={ElSallama}
        durationInFrames={FPS * 4}
        fps={FPS}
        width={W}
        height={H}
      />
      {/* Sesli konusma + otomatik agiz senkronu (sure sese gore otomatik) */}
      <Composition
        id="Konusma"
        component={Konusma}
        durationInFrames={FPS * 5}
        fps={FPS}
        width={W}
        height={H}
        calculateMetadata={async () => {
          const dur = await getAudioDurationInSeconds(staticFile("audio/ses-test.mp3"));
          return { durationInFrames: Math.ceil(dur * FPS) + 6 };
        }}
      />

      {/* SURATSIZ selamlama — duz JPG cutout + Merhaba (4:5) */}
      <Composition
        id="SuratsizMerhaba"
        component={SuratsizMerhaba}
        durationInFrames={FPS * 5}
        fps={FPS}
        width={1080}
        height={1350}
        calculateMetadata={async () => {
          const dur = await getAudioDurationInSeconds(staticFile("audio/merhaba.mp3"));
          return { durationInFrames: Math.ceil((0.7 + dur + 1.2) * FPS) };
        }}
      />

      {/* ROKET KALKIS — duz JPG'lerle 2.5D montaj (yatay 16:9) */}
      <Composition
        id="RoketKalkis"
        component={RoketKalkis}
        durationInFrames={522}
        fps={FPS}
        width={1920}
        height={1080}
      />

      {/* 30 saniyelik birlesik tanitim */}
      <Composition
        id="Suratsiz"
        component={Suratsiz30}
        durationInFrames={FPS * 30}
        fps={FPS}
        width={W}
        height={H}
      />
    </>
  );
};
