This directory holds PWA icon assets required by the manifest and tests.

Required files (PNG, exact sizes):
- icon-192.png         (192x192)
- icon-256.png         (256x256)
- icon-384.png         (384x384)
- icon-512.png         (512x512)
- maskable-192.png     (192x192, maskable-safe padding)
- maskable-512.png     (512x512, maskable-safe padding)
- ../apple-touch-icon.png (180x180) — goes in i/static/

Brand values in this app (placeholders):
- name: 144
- short_name: 144
- theme/background color: from CSS background (light: #fefefe). Use that as the base color.

Quick dummy icons you can create locally (no external tools in repo):
- Use ImageMagick (recommended):
  - 192 regular:
    convert -size 192x192 canvas:"#fefefe" -gravity center \
      -font DejaVu-Sans -pointsize 96 -fill "#1f2937" -annotate 0 "144" icon-192.png
  - 256 regular:
    convert -size 256x256 canvas:"#fefefe" -gravity center \
      -font DejaVu-Sans -pointsize 128 -fill "#1f2937" -annotate 0 "144" icon-256.png
  - 384 regular:
    convert -size 384x384 canvas:"#fefefe" -gravity center \
      -font DejaVu-Sans -pointsize 192 -fill "#1f2937" -annotate 0 "144" icon-384.png
  - 512 regular:
    convert -size 512x512 canvas:"#fefefe" -gravity center \
      -font DejaVu-Sans -pointsize 256 -fill "#1f2937" -annotate 0 "144" icon-512.png
  - Maskable (keep generous safe padding; simplest is a solid color with no text):
    convert -size 512x512 canvas:"#fefefe" maskable-512.png
    convert -size 192x192 canvas:"#fefefe" maskable-192.png
  - Apple touch icon (180x180):
    convert -size 180x180 canvas:"#fefefe" -gravity center \
      -font DejaVu-Sans -pointsize 96 -fill "#1f2937" -annotate 0 "144" ../apple-touch-icon.png

If you cannot run ImageMagick, here are HTML snippets with an embedded data URL you can save as PNGs:
- Steps:
  1) Copy the <img> tag’s data URL into your browser address bar.
  2) Right-click the rendered image and “Save image as…” with the target filename and exact size.

Example data URI placeholder (solid #fefefe, 1×1 stretched by browser; for correctness, prefer ImageMagick to get exact pixel sizes):
<img alt="1x1 white png" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=" />

Notes:
- Keep filenames exactly as listed; they’re referenced by vite-plugin-pwa and manifest.webmanifest.
- Replace these placeholders with your final brand icons before production.
