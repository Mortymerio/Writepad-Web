import { expect, test, describe } from 'vitest';
import { NmapParser } from '../NmapParser.js';

describe('NmapParser', () => {
  test('should parse basic open ports', () => {
    const xml = `
      <nmaprun>
        <host>
          <status state="up"/>
          <address addr="192.168.1.1" addrtype="ipv4"/>
          <ports>
            <port protocol="tcp" portid="80">
              <state state="open"/>
              <service name="http" product="Apache" version="2.4"/>
            </port>
          </ports>
        </host>
      </nmaprun>
    `;
    const hosts = NmapParser.parse(xml);
    expect(hosts).toHaveLength(1);
    expect(hosts[0].ip).toBe('192.168.1.1');
    expect(hosts[0].ports).toHaveLength(1);
    expect(hosts[0].ports[0].portId).toBe('80');
    expect(hosts[0].ports[0].service).toBe('http');
  });

  test('should ignore down hosts', () => {
    const xml = `
      <nmaprun>
        <host>
          <status state="down"/>
          <address addr="192.168.1.2" addrtype="ipv4"/>
        </host>
      </nmaprun>
    `;
    const hosts = NmapParser.parse(xml);
    expect(hosts).toHaveLength(0);
  });
  
  test('should ignore closed ports', () => {
    const xml = `
      <nmaprun>
        <host>
          <status state="up"/>
          <address addr="192.168.1.1" addrtype="ipv4"/>
          <ports>
            <port protocol="tcp" portid="80">
              <state state="closed"/>
            </port>
          </ports>
        </host>
      </nmaprun>
    `;
    const hosts = NmapParser.parse(xml);
    expect(hosts).toHaveLength(1);
    expect(hosts[0].ports).toHaveLength(0);
  });
  
  test('should throw on invalid XML', () => {
    expect(() => NmapParser.parse('<invalid></invalid>')).toThrow();
  });
});
