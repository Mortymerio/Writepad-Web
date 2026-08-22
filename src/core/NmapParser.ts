export const NmapParser = {
  parse(xmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check if valid Nmap XML
    if (!doc.querySelector('nmaprun')) {
      throw new Error("Invalid Nmap XML. Could not find <nmaprun> element.");
    }
    
    const hosts = [];
    const hostNodes = doc.querySelectorAll('host');
    
    for (let i = 0; i < hostNodes.length; i++) {
      const host = hostNodes[i];
      const statusNode = host.querySelector('status');
      const state = statusNode ? statusNode.getAttribute('state') : 'unknown';
      if (state !== 'up') continue;
      
      let ip = '';
      const addressNodes = host.querySelectorAll('address');
      for (let j = 0; j < addressNodes.length; j++) {
        if (addressNodes[j].getAttribute('addrtype') === 'ipv4' || !ip) {
          ip = addressNodes[j].getAttribute('addr') || '';
        }
      }
      
      const hostnameNode = host.querySelector('hostname');
      const hostname = hostnameNode ? hostnameNode.getAttribute('name') : '';
      
      const osMatchNode = host.querySelector('osmatch');
      const os = osMatchNode ? osMatchNode.getAttribute('name') : 'Unknown';
      
      const ports = [];
      const portNodes = host.querySelectorAll('port');
      for (let j = 0; j < portNodes.length; j++) {
        const port = portNodes[j];
        const portStateNode = port.querySelector('state');
        const portState = portStateNode ? portStateNode.getAttribute('state') : 'unknown';
        if (portState !== 'open') continue;
        
        const portId = port.getAttribute('portid') || '';
        const protocol = port.getAttribute('protocol') || '';
        const serviceNode = port.querySelector('service');
        const serviceName = serviceNode ? serviceNode.getAttribute('name') : 'unknown';
        const serviceProduct = serviceNode ? serviceNode.getAttribute('product') : '';
        const serviceVersion = serviceNode ? serviceNode.getAttribute('version') : '';
        
        ports.push({
          portId,
          protocol,
          service: serviceName,
          product: serviceProduct,
          version: serviceVersion
        });
      }
      
      hosts.push({ ip, hostname, os, ports });
    }
    
    return hosts;
  }
};
