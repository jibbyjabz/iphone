#!/usr/bin/env python3
"""Generate the app icons as PNGs with no third-party dependencies.

Draws a rounded-square indigo->violet gradient with a small white bar-chart
mark (finances + work). Run: python3 scripts/make_icons.py
"""
import struct
import zlib
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "icons")

# Brand colours
TOP = (79, 70, 229)      # indigo-600
BOTTOM = (124, 58, 237)  # violet-600
WHITE = (255, 255, 255)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def rounded(x, y, w, h, r):
    """True if pixel (x, y) is inside a rounded square of side w/h, radius r."""
    cx = min(max(x, r), w - r)
    cy = min(max(y, r), h - r)
    dx = x - cx
    dy = y - cy
    return dx * dx + dy * dy <= r * r


def make(size):
    radius = round(size * 0.22)
    px = bytearray()
    # Bar chart geometry (three rising bars), in unit fractions of size.
    bars = [
        (0.26, 0.62, 0.40),  # x-start, height-fraction-from-bottom-top, ...
    ]
    bar_w = size * 0.13
    gap = size * 0.07
    base_y = size * 0.74
    starts = [size * 0.28, size * 0.28 + bar_w + gap, size * 0.28 + 2 * (bar_w + gap)]
    heights = [size * 0.20, size * 0.32, size * 0.46]

    for y in range(size):
        # PNG filter byte (0 = none) at the start of each scanline
        px.append(0)
        for x in range(size):
            if not rounded(x, y, size, size, radius):
                px += bytes((0, 0, 0, 0))  # transparent corners
                continue
            t = y / (size - 1)
            r, g, b = lerp(TOP, BOTTOM, t)
            # Draw bars
            for i, sx in enumerate(starts):
                top = base_y - heights[i]
                if sx <= x < sx + bar_w and top <= y <= base_y:
                    r, g, b = WHITE
            px += bytes((r, g, b, 255))
    return bytes(px)


def write_png(path, size, raw):
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    idat = zlib.compress(raw, 9)
    with open(path, "wb") as f:
        f.write(sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b""))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, size in (("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)):
        write_png(os.path.join(OUT_DIR, name), size, make(size))
        print("wrote", name)


if __name__ == "__main__":
    main()
