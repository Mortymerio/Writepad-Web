export const Encodings = {
  ANSI: 'ANSI',
  UTF8: 'UTF-8',
  UTF8_BOM: 'UTF-8-BOM',
  UTF16_LE: 'UTF-16 LE BOM',
  UTF16_BE: 'UTF-16 BE BOM'
};

const WIN1252_ENCODE_MAP = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84,
  '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88,
  '\u2030': 0x89, '\u0160': 0x8A, '\u2039': 0x8B, '\u0152': 0x8C,
  '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92, '\u201C': 0x93,
  '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B,
  '\u0153': 0x9C, '\u017E': 0x9E, '\u0178': 0x9F
};

export const EncodingManager = {
  detectEncoding(buffer) {
    const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 4));
    
    // Check BOMs
    if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return Encodings.UTF8_BOM;
    if (bytes[0] === 0xFE && bytes[1] === 0xFF) return Encodings.UTF16_BE;
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) return Encodings.UTF16_LE;
    
    // Default to UTF-8 (we could do heuristics for ANSI but UTF-8 is safer fallback)
    return Encodings.UTF8;
  },

  decode(buffer, encoding) {
    let decoder;
    let offset = 0;
    
    switch (encoding) {
      case Encodings.ANSI:
        decoder = new TextDecoder('windows-1252');
        break;
      case Encodings.UTF8_BOM:
        decoder = new TextDecoder('utf-8');
        offset = 3;
        break;
      case Encodings.UTF16_BE:
        decoder = new TextDecoder('utf-16be');
        offset = 2;
        break;
      case Encodings.UTF16_LE:
        decoder = new TextDecoder('utf-16le');
        offset = 2;
        break;
      case Encodings.UTF8:
      default:
        decoder = new TextDecoder('utf-8');
        break;
    }
    
    const slice = new Uint8Array(buffer, offset);
    return decoder.decode(slice);
  },

  encode(text, encoding) {
    switch (encoding) {
      case Encodings.ANSI:
        return this._encodeANSI(text);
      case Encodings.UTF8_BOM:
        return this._encodeUTF8BOM(text);
      case Encodings.UTF16_BE:
        return this._encodeUTF16(text, true);
      case Encodings.UTF16_LE:
        return this._encodeUTF16(text, false);
      case Encodings.UTF8:
      default:
        return new TextEncoder().encode(text).buffer;
    }
  },
  
  _encodeANSI(text) {
    const buf = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (WIN1252_ENCODE_MAP[char] !== undefined) {
        buf[i] = WIN1252_ENCODE_MAP[char];
      } else {
        const code = char.charCodeAt(0);
        buf[i] = code < 256 ? code : 63; // 63 is '?' fallback
      }
    }
    return buf.buffer;
  },
  
  _encodeUTF8BOM(text) {
    const utf8 = new TextEncoder().encode(text);
    const buf = new Uint8Array(utf8.length + 3);
    buf[0] = 0xEF; buf[1] = 0xBB; buf[2] = 0xBF;
    buf.set(utf8, 3);
    return buf.buffer;
  },
  
  _encodeUTF16(text, bigEndian) {
    const buf = new Uint8Array(text.length * 2 + 2);
    // BOM
    if (bigEndian) {
      buf[0] = 0xFE; buf[1] = 0xFF;
    } else {
      buf[0] = 0xFF; buf[1] = 0xFE;
    }
    
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (bigEndian) {
        buf[2 + i*2] = (code >> 8) & 0xFF;
        buf[2 + i*2 + 1] = code & 0xFF;
      } else {
        buf[2 + i*2] = code & 0xFF;
        buf[2 + i*2 + 1] = (code >> 8) & 0xFF;
      }
    }
    return buf.buffer;
  }
};
