# -*- coding: utf-8 -*-
"""Roket animasyonu icin telifsiz ses sentezi (numpy + wave)."""
import numpy as np
import wave
import os

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(OUT, exist_ok=True)


def save(name, sig):
    sig = np.clip(sig, -1, 1)
    pcm = (sig * 32767).astype(np.int16)
    path = os.path.join(OUT, name)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("yazildi:", name, round(len(sig) / SR, 2), "sn")


def norm(x):
    m = np.max(np.abs(x)) or 1
    return x / m


# ---------- 1) KALKIS GUMBURTUSU (rumble, ~9 sn, yukselen) ----------
def rumble(dur=9.0):
    n = int(SR * dur)
    white = np.random.randn(n)
    brown = np.cumsum(white)              # alcak frekans agirlikli
    brown = brown - np.convolve(brown, np.ones(2000) / 2000, mode="same")  # DC at
    brown = norm(brown)
    sub = np.sin(2 * np.pi * 42 * np.arange(n) / SR)   # govde icin alt sinus
    sub += 0.5 * np.sin(2 * np.pi * 28 * np.arange(n) / SR)
    body = norm(0.7 * brown + 0.5 * sub)
    # zarf: ilk 3.5 sn artar (motor uyaniyor), sonra guclu, sonda hafif iner
    t = np.arange(n) / SR
    env = np.interp(t, [0, 3.5, 4.0, 8.0, 9.0], [0.05, 0.55, 1.0, 0.9, 0.5])
    return body * env * 0.9


# ---------- 2) WHOOSH (kalkis ani, ~1.4 sn) ----------
def whoosh(dur=1.4):
    n = int(SR * dur)
    white = np.random.randn(n)
    # acilip kapanan parlaklik icin white + brown karisimi, hann zarf
    brown = norm(np.cumsum(white))
    t = np.linspace(0, 1, n)
    bright = np.interp(t, [0, 0.4, 1], [0.2, 1.0, 0.1])   # ortada tiz acilir
    sig = norm(bright * white + (1 - bright) * brown)
    env = np.sin(np.pi * t) ** 1.5                          # yumusak gir-cik
    return sig * env * 0.8


# ---------- 3) ARKA PLAN MUZIGI (~17.4 sn, sinematik pad) ----------
def music(dur=17.4):
    n = int(SR * dur)
    t = np.arange(n) / SR
    out = np.zeros(n)

    # akor ilerlemesi (Am - F - C - G), yukseltici his
    chords = [
        [220.00, 261.63, 329.63],  # Am
        [174.61, 220.00, 261.63],  # F
        [261.63, 329.63, 392.00],  # C
        [196.00, 246.94, 293.66],  # G
    ]
    seg = dur / len(chords)
    for ci, ch in enumerate(chords):
        start = ci * seg
        s0 = int(start * SR)
        s1 = int(min(dur, start + seg + 0.6) * SR)  # akorlar hafif binsin
        idx = np.arange(s0, s1)
        lt = (idx - s0) / SR
        # yumusak giris/cikis zarfi
        env = np.interp(lt, [0, 0.5, seg - 0.2, seg + 0.6], [0, 1, 0.9, 0]) * 0.16
        pad = np.zeros(len(idx))
        for f in ch:
            vib = 1 + 0.003 * np.sin(2 * np.pi * 5 * lt)
            pad += np.sin(2 * np.pi * f * (idx / SR) * vib)
            pad += 0.3 * np.sin(2 * np.pi * 2 * f * (idx / SR))  # oktav parlaklik
        out[s0:s1] += env * pad / len(ch)

    # alt bas (kok notalar)
    roots = [55.0, 43.65, 65.41, 49.0]
    for ci, rfreq in enumerate(roots):
        s0 = int(ci * seg * SR)
        s1 = int(min(dur, (ci + 1) * seg) * SR)
        idx = np.arange(s0, s1)
        lt = (idx - s0) / SR
        env = np.interp(lt, [0, 0.3, seg - 0.3, seg], [0, 1, 1, 0]) * 0.12
        out[s0:s1] += env * np.sin(2 * np.pi * rfreq * idx / SR)

    # hafif can arpejleri (pentatonik parilti) — son yarida
    bells = [523.25, 659.26, 783.99, 1046.50]
    for k in range(8):
        bt = 9.0 + k * 0.9
        if bt > dur - 0.5:
            break
        s0 = int(bt * SR)
        f = bells[k % len(bells)]
        ln = int(0.7 * SR)
        idx = np.arange(ln)
        decay = np.exp(-idx / SR * 4.5)
        out[s0:s0 + ln] += 0.07 * decay * np.sin(2 * np.pi * f * idx / SR)

    # genel yumusak fade in/out
    fi = int(0.8 * SR)
    out[:fi] *= np.linspace(0, 1, fi)
    out[-fi:] *= np.linspace(1, 0, fi)
    return norm(out) * 0.7


save("rumble.wav", rumble())
save("whoosh.wav", whoosh())
save("music.wav", music())
print("Tamam.")
