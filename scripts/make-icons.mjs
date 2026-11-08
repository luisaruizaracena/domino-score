// Genera los iconos PNG de la PWA (ficha de dominó dorada) sin dependencias.
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const BG = [0x0b, 0x12, 0x20], GOLD = [0xf5, 0xc4, 0x5e]

function crc32(buf) {
  let c, crc = 0xffffffff
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
const inRoundRect = (x, y, x0, y0, w, h, r) => {
  const cx = Math.min(Math.max(x, x0 + r), x0 + w - r)
  const cy = Math.min(Math.max(y, y0 + r), y0 + h - r)
  return x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h && (x - cx) ** 2 + (y - cy) ** 2 <= r * r
}

function icon(size, { rounded, scale }) {
  const s = size / 512
  const off = (512 - 512 * scale) / 2
  const T = (v) => (off + v * scale) * s // transform coordinate in 512 space
  const pips = [[226, 132], [286, 200], [226, 312], [286, 312], [226, 380], [286, 380]]
  const raw = Buffer.alloc((size * 4 + 1) * size)
  const SS = 3 // supersampling
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    for (let x = 0; x < size; x++) {
      let acc = [0, 0, 0, 0]
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const px = x + (sx + 0.5) / SS, py = y + (sy + 0.5) / SS
        let col = null
        if (!rounded || inRoundRect(px, py, 0, 0, size, size, 112 * s)) col = BG
        if (inRoundRect(px, py, T(166), T(76), 180 * scale * s, 360 * scale * s, 40 * scale * s)) {
          col = GOLD
          if (inRoundRect(px, py, T(190), T(252), 132 * scale * s, 8 * scale * s, 4 * scale * s)) col = BG
          for (const [cx, cy] of pips) if ((px - T(cx)) ** 2 + (py - T(cy)) ** 2 <= (18 * scale * s) ** 2) col = BG
        }
        if (col) { acc[0] += col[0]; acc[1] += col[1]; acc[2] += col[2]; acc[3] += 255 }
      }
      const n = SS * SS, i = y * (size * 4 + 1) + 1 + x * 4
      const a = acc[3] / n
      raw[i] = a ? acc[0] / (acc[3] / 255) : 0
      raw[i + 1] = a ? acc[1] / (acc[3] / 255) : 0
      raw[i + 2] = a ? acc[2] / (acc[3] / 255) : 0
      raw[i + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ])
}

writeFileSync('public/icon-192.png', icon(192, { rounded: true, scale: 1 }))
writeFileSync('public/icon-512.png', icon(512, { rounded: true, scale: 1 }))
writeFileSync('public/icon-maskable-512.png', icon(512, { rounded: false, scale: 0.75 }))
writeFileSync('public/apple-touch-icon.png', icon(180, { rounded: false, scale: 0.85 }))
console.log('iconos generados')
