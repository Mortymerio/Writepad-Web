# Writepad Web 🚀

Writepad Web is a lightweight, VSCode-like web-based text editor tailored for developers and cybersecurity enthusiasts (Penetration Testers, Red Teamers, CTF players). It runs entirely in your browser using the powerful Monaco Editor engine, bringing advanced editing capabilities, syntax highlighting, and built-in penetration testing tools directly to your fingertips.

## Features ✨

### Core Editor
- **Monaco Engine**: The same engine that powers VSCode, providing flawless syntax highlighting, minimap, and smooth performance for massive files.
- **Vim Mode Integration**: Built-in toggleable Vim mode for extreme productivity.
- **Macro Engine**: Record, playback, and save multi-step editing macros (e.g., formatting raw data into structured arrays).
- **Tab Management**: Open multiple files simultaneously, side-by-side editing, and syntax auto-detection based on file extensions.

### CyberSec Tool Suite 🛡️
Writepad Web features an exclusive **CyberSec Profile** that unlocks a dynamic right-hand sidebar with powerful tools designed to speed up your hacking workflow:

- **GTFOBins Wiki**: Instantly search for Linux binaries to bypass local security restrictions and escalate privileges.
- **Reverse Shell Generator**: Enter your IP and Port once, and instantly copy from dozens of automatically generated, copy-paste ready reverse shell payloads (Bash, Python, Perl, PowerShell, etc.).
- **SQLi Cheat Sheet**: Quick reference for SQL injection vectors including Error-Based, Time-Based, and UNION attacks across major database engines.
- **PEAS Guides**: Integrated quick-reference manuals for LinPEAS and WinPEAS to help you analyze privilege escalation vectors effectively.
- **Encoder / Decoder Panel**: Instantly convert text between Base64, URL Encoding, HTML Entities, Hex, and ROT13 directly from the editor selection.
- **Hash Identifier & Cracker**: Paste a hash and let the tool automatically identify its type (MD5, SHA1, NTLM, bcrypt, etc.) and generate the exact `hashcat` or `john` command required to crack it.
- **LFI / Path Traversal Wiki**: A categorized database of payloads to exploit Local File Inclusion and Directory Traversal vulnerabilities, including PHP Wrappers and WAF bypasses.
- **XSS Polyglot Generator**: A dynamic generator that wraps your custom Javascript payload (e.g., `alert(1)`) into advanced XSS polyglots designed to break out of multiple HTML contexts simultaneously.

## Privacy & Evasion 🥷
- **Zero Cloud Footprint**: Writepad Web operates 100% locally in your browser. Files are saved to your browser's `localStorage` or your local filesystem (via File System Access API). 
- **AV Evasion**: All sensitive payloads (like Reverse Shells, LFI strings, and XSS Polyglots) are stored in the codebase as Base64 encoded strings and decoded at runtime. This prevents aggressive antivirus solutions (like Windows Defender) from flagging the source code or the deployed web application.

## Run Locally 🛠️

1. Clone the repository:
   ```bash
   git clone https://github.com/Mortymerio/Writepad-Web.git
   cd Writepad-Web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## License
MIT License. Free to use, modify, and distribute. Happy Hacking!
