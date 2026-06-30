# Animasyon Projesi — Çalışma Notları

Adobe Illustrator görsellerini **Remotion** (React/TypeScript) ile 2D animasyona / kısa tanıtım videolarına çeviren proje. Kullanıcı (Ferhat) tasarımcı; kod yazmıyor — görselleri sağlıyor, animasyonu Claude yapıyor. İletişim Türkçe.

> Detaylı proje hafızası: `C:\Users\info\.claude\projects\c--dev-Animasyon\memory\animasyon-projesi.md`

## Çalıştırma

```bash
npm run dev        # Remotion Studio (canlı önizleme, sahneleri tek tek oyna)
npx remotion render <Kompozisyon> out/<dosya>.mp4
npx remotion still  <Kompozisyon> out/<kare>.png --frame=N   # tek kare kontrol
npx remotion ffprobe out/<dosya>.mp4                          # ses/video akışı doğrula
```

- Node 24, Python 3.14. Render ilk seferde Chrome Headless indirir.
- ffmpeg PATH'te yok; Remotion kendi ffmpeg'ini kullanır (`npx remotion ffmpeg/ffprobe`).
- Geçici/temp dosyalar için sistem temp değil, scratchpad kullan.

## Kompozisyonlar (src/Root.tsx)

| ID | Bileşen | Boyut | Açıklama |
|---|---|---|---|
| `Yuruyus` / `Ziplama` / `ElSallama` | src/Scenes.tsx | 1080×1350 | Kod-çizimli SURATSIZ rig demosu (yürüme/zıplama/el sallama) |
| `Suratsiz` | src/Scenes.tsx | 1080×1350 | Yukarıdakilerin 30 sn birleşik hali |
| `Konusma` | src/Konusma.tsx | 1080×1350 | Otomatik ağız senkronu (lip-sync) demosu, ses genliğinden |
| `SuratsizMerhaba` | src/SuratsizMerhaba.tsx | 1080×1350 | **Gerçek poster JPEG cutout'u** + "Merhaba" selamlama (✅ son iş) |
| `RoketKalkis` | src/roket/RoketKalkis.tsx | 1920×1080 | **Roket kalkış tanıtımı**, gerçek JPG'lerle, sesli (✅ tamamlandı) |

## Önemli teknik kavramlar

- **Rigging (katmanlı SVG):** Karakter parçalara ayrılır (Kafa, Govde, SolKol, SagKol, SolBacak, SagBacak, Gozler, Agiz); her uzuv kendi pivotunda döner. Kod-rig örneği `src/Suratsiz.tsx`, hareket döngüleri `src/animations.ts` (walkPose/jumpPose/wavePose + nefes/göz kırpma).
- **2.5D montaj (düz JPG):** Parçalanamayan düz görsellerde kamera (Ken Burns zoom/pan), sarsıntı, parallax + prosedürel duman/alev/yıldız overlay + crossfade. Roket gibi katı nesneler için yeterli. `src/roket/FX.tsx` (Stars, Smoke, Flame, AnimatedFlame, Glow, Vignette).
- **Cutout (düz JPG karakter):** Açık/temiz arka planlı poster JPEG'inden karakteri saturation tabanlı + kenara-bağlı bölge silme ile şeffaf PNG yapma → `tools/cutout.py` (scipy/Pillow). Çıktı `public/suratsiz/suratsiz.png`.
- **Ağız senkronu (lip-sync):** `@remotion/media-utils` ile `getAudioData` + `visualizeAudio`, ses genliği → mouthOpen / squash.

## Ses (tamamı ücretsiz/telifsiz, kod ile üretilir)

- **Seslendirme:** Edge-TTS (Python, kurulu). Türkçe sesler: `tr-TR-EmelNeural` (kadın), `tr-TR-AhmetNeural` (erkek). Örn:
  `python -m edge_tts --voice tr-TR-EmelNeural --pitch=+15Hz --rate=+3% --text "..." --write-media public/audio/x.mp3`
- **SFX + müzik:** `tools/generate_audio.py` (numpy + wave) → `rumble.wav`, `whoosh.wav`, `music.wav`. Müzik Am–F–C–G akor pad + alt bas + çan arpejleri.
- Ses dosyaları `public/audio/` içinde. Remotion'da `<Audio src={staticFile("audio/..")} volume={..}>`, gecikme için `<Sequence from={..}>`.

## Kararlar / tercihler

- Seslendirme motoru: **Edge-TTS (ücretsiz)** seçildi.
- Hedef tanıtım süresi ~60 sn; sahne başına ideal 4–6 sn; **fps 24–30** (24 önerildi, şu an 30).
- Format: karakter 4:5 (1080×1350), roket yatay 16:9 (1920×1080).
- Adobe Animate'e canlı bağlantı YOK (MCP yok); sadece JSFL/Canvas kodu yazılabilir. Bu iş akışı için **Remotion daha verimli** (Claude uçtan uca kontrol ediyor). Canlı kontrol edilebilen alternatifler: Figma (tasarım), Blender (3D).

## Tamamlananlar (2026-06-30/07-01)

1. Remotion kuruldu, kod-rig SURATSIZ ile yürüme/zıplama/el sallama + 30 sn birleşik.
2. Türkçe TTS + otomatik lip-sync kanıtlandı.
3. **Roket tanıtımı** (`RoketKalkis`): 4 gerçek JPG (pad→kalkis→ucus→pencere), sinematik kamera + sarsıntı + **hareketli alev (titreşen diller + kıvılcım)** + müzik + gümbürtü + whoosh + 4 satır Türkçe anlatım. Çıktı: `out/roket-final-sesli.mp4` (17.4 sn, video+ses doğrulandı).
4. **SURATSIZ selamlama** (`SuratsizMerhaba`): poster JPEG → cutout, zıplayarak giriş + sallanma + "Merhaba!" balonu + "Merhaba! Ben Suratsız!.." sesi + konuşma squash. Çıktı: `out/suratsiz-merhaba.mp4` (7.8 sn).

## Sıradaki adımlar / yarın devam

- [ ] **Gerçek kol/el sallama:** SURATSIZ için **katmanlı SVG** gerekli (düz JPG'de kol gövdeyle aynı renk+bitişik, ayrılamıyor). Tasarımcıdan parçalı SVG gelince `src/Suratsiz.tsx` mantığıyla rigle → gerçek kol döndürme + tam lip-sync. Bu beklemede.
- [ ] Roket veya selamlama videosunda metin/ses/tempo ince ayarı (kullanıcı isterse).
- [ ] İstenirse: selamlama + roket sahnelerini tek tanıtımda birleştirme.
- [ ] 2-3 karakterli diyaloglu ~60 sn sahne (senaryo metni + katmanlı SVG'ler gelince).
- [ ] Gerçek müzik/SFX dosyası verilirse sentetiklerin yerine koy (daha profesyonel).

## Notlar

- `.fla` (Adobe Animate) ikili → okunamaz; gerekirse `.xfl` (XML) iste.
- Gerçek görseller `assets/` altında; Remotion'un okuması için `public/`'e kopyalanır.
- `assets/suratsiz/suratsiz.jpeg` tek parça poster; cutout `public/suratsiz/suratsiz.png` (747×797).
