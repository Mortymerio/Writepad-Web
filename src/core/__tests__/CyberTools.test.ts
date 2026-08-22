import { describe, it, expect } from 'vitest';
import { CyberUtils } from '../CyberTools';

describe('CyberUtils', () => {
  it('base64Encode y base64Decode', () => {
    const original = 'Hello World 🤖';
    const encoded = CyberUtils.base64Encode(original);
    expect(encoded).not.toBe(original);
    const decoded = CyberUtils.base64Decode(encoded);
    expect(decoded).toBe(original);
  });

  it('hexEncode y hexDecode', () => {
    const original = 'test';
    const encoded = CyberUtils.hexEncode(original);
    expect(encoded).toBe('74657374');
    const decoded = CyberUtils.hexDecode(encoded);
    expect(decoded).toBe(original);
  });

  it('calculateShannonEntropy', () => {
    expect(CyberUtils.calculateShannonEntropy('aaaa')).toBe(0);
    expect(CyberUtils.calculateShannonEntropy('abcd')).toBe(2);
  });

  it('extractIOCs', () => {
    const text = 'Contact me at test@example.com or visit http://example.com. IP is 192.168.1.1.';
    const iocs = CyberUtils.extractIOCs(text);
    expect(iocs.emails).toContain('test@example.com');
    expect(iocs.urls).toContain('http://example.com.');
    expect(iocs.ips).toContain('192.168.1.1');
  });

  it('defang y refang', () => {
    const original = 'http://malicious.com';
    const defanged = CyberUtils.defang(original);
    expect(defanged).toBe('hxxp://malicious[.]com');
    const refanged = CyberUtils.refang(defanged);
    expect(refanged).toBe(original);
  });

  it('rot13', () => {
    const original = 'Hello World';
    const encoded = CyberUtils.rot13(original);
    expect(encoded).toBe('Uryyb Jbeyq');
    const decoded = CyberUtils.rot13(encoded);
    expect(decoded).toBe(original);
  });

  it('xor', () => {
    const original = 'test';
    const encoded = CyberUtils.xor(original, 42);
    expect(encoded).not.toBe(original);
    const decoded = CyberUtils.xor(encoded, 42);
    expect(decoded).toBe(original);
  });

  it('decodeJWT', () => {
    // Header: {"alg":"HS256","typ":"JWT"} => eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    // Payload: {"sub":"123"} => eyJzdWIiOiIxMjMifQ
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature';
    const result = CyberUtils.decodeJWT(token);
    expect(result.header.alg).toBe('HS256');
    expect(result.payload.sub).toBe('123');
  });
});
