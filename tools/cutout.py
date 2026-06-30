# -*- coding: utf-8 -*-
"""SURATSIZ poster JPEG -> temiz seffaf karakter cutout.

Arka plan = dusuk doygunluk (grimsi) + parlak pikseller, kenara bagli olanlar.
Boylece gozlerin beyazi gibi ic acik bolgeler korunur, halo/yansima silinir.
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "assets", "suratsiz", "suratsiz.jpeg")
OUT = os.path.join(ROOT, "public", "suratsiz")
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGB")
W, H = img.size
rgb = np.array(img).astype(np.int16)

mx = rgb.max(axis=-1)
mn = rgb.min(axis=-1)
sat = mx - mn
val = mx

# arka plan adayi: grimsi (dusuk sat) ve parlak
bg_cand = (sat < 26) & (val > 135)

# kenara bagli olanlari bul
lbl, n = ndimage.label(bg_cand)
border = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
border.discard(0)
bg = np.isin(lbl, list(border))

# kucuk delikleri (karakter icinde yanlislikla bg olan minik bolgeler) doldur
char_mask = ~bg
char_mask = ndimage.binary_closing(char_mask, structure=np.ones((3, 3)), iterations=2)

# sadece en buyuk bagli bileseni tut (yansima/artiklari at)
clbl, cn = ndimage.label(char_mask)
if cn > 1:
    sizes = ndimage.sum(np.ones_like(clbl), clbl, range(1, cn + 1))
    biggest = int(np.argmax(sizes)) + 1
    char_mask = clbl == biggest

alpha = np.where(char_mask, 255, 0).astype(np.uint8)
rgba = np.dstack([rgb.astype(np.uint8), alpha])
full = Image.fromarray(rgba, "RGBA")

# baslik bolgesini (ust %26) at, karakteri kirp
a = alpha.copy()
a[: int(H * 0.26), :] = 0
ys, xs = np.where(a > 0)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
pad = 8
box = (max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad))
char = full.crop(box)
char.save(os.path.join(OUT, "suratsiz.png"))
print("karakter cutout:", char.size, "kirpma:", box)
