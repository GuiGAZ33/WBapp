/* =========================================================
   世界织卷 · 极简 NBT / Sponge .schem 导出器
   - 不依赖第三方库
   - 生成 Litematica / WorldEdit 可读取的 .schem（Sponge v2）
   ========================================================= */
(function () {
  'use strict';

  class ByteWriter {
    constructor(size = 1024) {
      this.buf = new Uint8Array(size);
      this.len = 0;
    }
    ensure(n) {
      if (this.len + n <= this.buf.length) return;
      let size = this.buf.length;
      while (size < this.len + n) size *= 2;
      const next = new Uint8Array(size);
      next.set(this.buf.subarray(0, this.len));
      this.buf = next;
    }
    byte(v) { this.ensure(1); this.buf[this.len++] = v & 255; }
    short(v) { this.ensure(2); this.buf[this.len++] = (v >> 8) & 255; this.buf[this.len++] = v & 255; }
    int(v) {
      this.ensure(4);
      this.buf[this.len++] = (v >>> 24) & 255;
      this.buf[this.len++] = (v >>> 16) & 255;
      this.buf[this.len++] = (v >>> 8) & 255;
      this.buf[this.len++] = v & 255;
    }
    bytes(arr) { this.ensure(arr.length); this.buf.set(arr, this.len); this.len += arr.length; }
    str(value) {
      const encoded = new TextEncoder().encode(String(value));
      this.short(encoded.length);
      this.bytes(encoded);
    }
    result() { return this.buf.slice(0, this.len); }
  }

  function varint(value) {
    const out = [];
    let v = value >>> 0;
    do {
      let b = v & 127;
      v >>>= 7;
      if (v) b |= 128;
      out.push(b);
    } while (v);
    return out;
  }

  function named(w, type, name) {
    w.byte(type);
    w.str(name);
  }

  function buildSchematic(options) {
    const width = Math.max(1, Math.min(32767, Math.floor(options.width)));
    const height = Math.max(1, Math.min(32767, Math.floor(options.height)));
    const length = Math.max(1, Math.min(32767, Math.floor(options.length)));
    const blocks = options.blocks || [];
    const total = width * height * length;
    if (blocks.length !== total) throw new Error(`方块数组长度应为 ${total}，实际 ${blocks.length}`);

    const palette = [];
    const paletteMap = new Map();
    const data = [];
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i] || 'minecraft:air';
      if (!paletteMap.has(block)) {
        paletteMap.set(block, palette.length);
        palette.push(block);
      }
      const index = paletteMap.get(block);
      const bytes = varint(index);
      for (let j = 0; j < bytes.length; j++) data.push(bytes[j]);
    }

    const w = new ByteWriter(64 * 1024);
    w.byte(10); w.str('Schematic'); // TAG_Compound root
    named(w, 3, 'Version'); w.int(2);
    named(w, 3, 'DataVersion'); w.int(options.dataVersion || 4189);
    named(w, 2, 'Width'); w.short(width);
    named(w, 2, 'Height'); w.short(height);
    named(w, 2, 'Length'); w.short(length);
    named(w, 11, 'Offset'); w.int(0); w.int(0); w.int(0);
    named(w, 10, 'Metadata');
    named(w, 8, 'Name'); w.str(options.name || '世界织卷投影');
    named(w, 8, 'Author'); w.str(options.author || '世界织卷');
    w.byte(0); // end Metadata

    named(w, 10, 'Palette');
    palette.forEach((block, index) => {
      named(w, 3, block);
      w.int(index);
    });
    w.byte(0); // end Palette
    named(w, 3, 'PaletteMax'); w.int(palette.length);
    named(w, 7, 'BlockData'); w.int(data.length); w.bytes(data);
    named(w, 9, 'BlockEntities'); w.byte(10); w.int(0);
    w.byte(0); // end root

    return {
      data: w.result(),
      width,
      height,
      length,
      palette: palette.slice(),
      blockCount: blocks.filter((b) => b && b !== 'minecraft:air').length
    };
  }

  async function gzip(bytes) {
    if (typeof CompressionStream !== 'function') return bytes;
    try {
      const cs = new CompressionStream('gzip');
      const stream = new Blob([bytes]).stream().pipeThrough(cs);
      const buffer = await new Response(stream).arrayBuffer();
      return new Uint8Array(buffer);
    } catch {
      return bytes;
    }
  }

  window.WWNBT = { buildSchematic, gzip };
})();
