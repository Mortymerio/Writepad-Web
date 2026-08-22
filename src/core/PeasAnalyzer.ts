export const PeasAnalyzer = {
  analyze(text: string) {
    if (!text) return [];
    
    const lines = text.split('\n');
    const findings = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('RED/YELLOW') || line.includes('CVE-') || line.toLowerCase().includes('vulnerable')) {
        findings.push({ severity: 'High', line, lineNumber: i + 1 });
      }
      else if (line.includes('SUID') || line.includes('capabilities') || line.includes('root') && line.includes('execute')) {
        findings.push({ severity: 'Medium', line, lineNumber: i + 1 });
      }
      else if (line.includes('Interesting') || line.includes('password') || line.includes('credential')) {
        findings.push({ severity: 'Low', line, lineNumber: i + 1 });
      }
    }
    
    return findings;
  }
};
