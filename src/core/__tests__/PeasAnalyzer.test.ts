import { expect, test, describe } from 'vitest';
import { PeasAnalyzer } from '../PeasAnalyzer.js';

describe('PeasAnalyzer', () => {
  test('should detect high severity issues', () => {
    const log = `Normal line\nThis is vulnerable CVE-2021-3156\nAnother line`;
    const findings = PeasAnalyzer.analyze(log);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('High');
    expect(findings[0].lineNumber).toBe(2);
  });

  test('should detect medium severity SUID binaries', () => {
    const log = `Checking SUID binaries...\n/usr/bin/find`;
    const findings = PeasAnalyzer.analyze(log);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('Medium');
    expect(findings[0].lineNumber).toBe(1);
  });
  
  test('should detect low severity interesting files', () => {
    const log = `Found password in config file`;
    const findings = PeasAnalyzer.analyze(log);
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('Low');
  });
  
  test('should return empty for clean logs', () => {
    const log = `All good here\nSystem is secure`;
    const findings = PeasAnalyzer.analyze(log);
    expect(findings).toHaveLength(0);
  });
});
