import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([lenBuf, toCrc, crcBuf]);
}

function generatePNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  
  // Scanlines: width * 4 bytes (RGBA) + 1 filter byte per line
  const rawData = Buffer.alloc(height * (1 + width * 4));
  
  const cx = width / 2;
  const cy = height / 2;
  const radius = size * 0.44;
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // Filter byte: None
    
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      let r = 15, g = 61, b = 92, a = 255; // #0F3D5C Brand primary
      
      // Subtle background corner rounded if not maskable
      if (!isMaskable) {
        // Squircle corner check
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (cornerDist > size * 0.48) {
          a = 0;
        }
      }
      
      // Hardhat dome (amber #F59E0B)
      const domeDy = y - (cy - size * 0.05);
      const domeDx = dx;
      if (domeDy < 0 && (domeDx * domeDx / ((size * 0.22) * (size * 0.22)) + (domeDy * domeDy) / ((size * 0.16) * (size * 0.16))) <= 1) {
        r = 245; g = 158; b = 11; // Amber
      }
      
      // Helmet rim
      if (Math.abs(y - (cy - size * 0.05)) < size * 0.03 && Math.abs(dx) < size * 0.28) {
        r = 217; g = 119; b = 6; // Darker Amber
      }
      
      // "K" symbol in center lower
      if (Math.abs(y - (cy + size * 0.18)) < size * 0.1) {
        // Vertical stem of K
        if (x >= cx - size * 0.08 && x <= cx - size * 0.04) {
          r = 255; g = 255; b = 255;
        }
        // Diagonal arms of K
        const armY = y - (cy + size * 0.18);
        const expectedX = cx - size * 0.04 + Math.abs(armY) * 0.9;
        if (Math.abs(x - expectedX) < size * 0.025) {
          r = 255; g = 255; b = 255;
        }
      }
      
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }
  
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  
  const idatData = zlib.deflateSync(rawData);
  
  const png = Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
  
  return png;
}

import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), generatePNG(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), generatePNG(512));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), generatePNG(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180));
console.log('PWA PNG Icons successfully generated!');

