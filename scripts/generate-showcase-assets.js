const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'showcase');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const cards = {
  'slot-4.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1f2923" />
        <stop offset="100%" stop-color="#141a16" />
      </linearGradient>
    </defs>
    <rect width="500" height="500" rx="40" fill="url(#bg4)" />
    <rect x="30" y="30" width="440" height="440" rx="28" fill="none" stroke="#33463a" stroke-width="1.5" stroke-dasharray="4 4" />
    <rect x="50" y="55" width="90" height="26" rx="13" fill="#2f4235" />
    <text x="95" y="72" fill="#86a894" font-family="sans-serif" font-size="11" font-weight="700" letter-spacing="2" text-anchor="middle">0095</text>
    <text x="450" y="72" fill="#617b6c" font-family="sans-serif" font-size="12" font-weight="600" letter-spacing="2" text-anchor="end">SEVILLA</text>
    <text x="250" y="210" fill="#b5d1c0" font-family="sans-serif" font-size="16" font-weight="600" letter-spacing="4" text-anchor="middle">2026</text>
    <text x="250" y="265" fill="#e2f0e7" font-family="sans-serif" font-size="44" font-weight="800" letter-spacing="6" text-anchor="middle">NOV</text>
    <rect x="210" y="295" width="80" height="3" rx="1.5" fill="#f97316" />
    <rect x="130" y="390" width="240" height="42" rx="21" fill="#243329" stroke="#3e5746" stroke-width="1" />
    <text x="250" y="416" fill="#a0c5ae" font-family="sans-serif" font-size="12" font-weight="700" letter-spacing="2" text-anchor="middle">SOC 2 CERTIFIED</text>
  </svg>`,

  'slot-5.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f1412" />
        <stop offset="100%" stop-color="#18211c" />
      </linearGradient>
    </defs>
    <rect width="500" height="500" rx="40" fill="url(#bg5)" />
    <circle cx="250" cy="250" r="180" fill="none" stroke="#24312a" stroke-width="1" />
    <circle cx="250" cy="250" r="140" fill="none" stroke="#2e3f36" stroke-width="1" stroke-dasharray="6 6" />
    <text x="50" y="75" fill="#6a8274" font-family="sans-serif" font-size="13" font-weight="600" letter-spacing="2">METRIC</text>
    <text x="250" y="260" fill="#f3f8f5" font-family="sans-serif" font-size="110" font-weight="900" letter-spacing="-4" text-anchor="middle">12K<tspan font-size="50" fill="#f97316">+</tspan></text>
    <text x="250" y="310" fill="#8da898" font-family="sans-serif" font-size="15" font-weight="600" letter-spacing="3" text-anchor="middle">ANSWERS COMPILED</text>
    <text x="250" y="430" fill="#576c61" font-family="sans-serif" font-size="11" font-weight="500" letter-spacing="1" text-anchor="middle">99.4% ACCEPTANCE RATE</text>
  </svg>`,

  'slot-6.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <rect width="500" height="500" rx="40" fill="#ece8df" />
    <text x="250" y="90" fill="#2e3b32" font-family="sans-serif" font-size="22" font-weight="800" letter-spacing="5" text-anchor="middle">ULTIMATE TASTE</text>
    <rect x="215" y="110" width="70" height="3" rx="1.5" fill="#556b5b" />
    <g fill="#4f6354">
      <circle cx="100" cy="320" r="55" />
      <circle cx="175" cy="320" r="55" />
      <circle cx="250" cy="320" r="55" />
      <circle cx="325" cy="320" r="55" />
      <circle cx="400" cy="320" r="55" />
      <circle cx="138" cy="375" r="55" />
      <circle cx="212" cy="375" r="55" />
      <circle cx="288" cy="375" r="55" />
      <circle cx="362" cy="375" r="55" />
      <circle cx="175" cy="430" r="55" />
      <circle cx="250" cy="430" r="55" />
      <circle cx="325" cy="430" r="55" />
    </g>
    <text x="250" y="180" fill="#687d6e" font-family="sans-serif" font-size="12" font-weight="600" letter-spacing="2" text-anchor="middle">SECURITY ARCHITECTURE</text>
  </svg>`,

  'slot-7.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bg7" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1a241f" />
        <stop offset="100%" stop-color="#0d1310" />
      </linearGradient>
    </defs>
    <rect width="500" height="500" rx="40" fill="url(#bg7)" />
    <text x="50" y="75" fill="#f97316" font-family="sans-serif" font-size="14" font-weight="800" letter-spacing="2">NIST SP 800-61</text>
    <rect x="360" y="55" width="90" height="28" rx="14" fill="#243329" />
    <text x="405" y="73" fill="#4ade80" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">ACTIVE</text>
    <text x="50" y="180" fill="#8ea698" font-family="sans-serif" font-size="13" font-weight="600" letter-spacing="1">INCIDENT RESPONSE</text>
    <text x="50" y="235" fill="#ffffff" font-family="sans-serif" font-size="42" font-weight="800" letter-spacing="-1">15-min SLA</text>
    <text x="50" y="275" fill="#9bb3a5" font-family="sans-serif" font-size="14">Automated triaging and alert dispatching</text>
    <rect x="50" y="360" width="400" height="8" rx="4" fill="#27362c" />
    <rect x="50" y="360" width="370" height="8" rx="4" fill="#f97316" />
    <text x="50" y="410" fill="#688273" font-family="sans-serif" font-size="12" font-weight="600">92.5% FASTER RESOLUTION</text>
    <text x="450" y="410" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="700" text-anchor="end">TIER 1</text>
  </svg>`,

  'slot-8.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <rect width="500" height="500" rx="40" fill="#f3efe6" />
    <rect x="170" y="60" width="160" height="200" rx="80" fill="#d8dfd5" />
    <ellipse cx="250" cy="150" rx="35" ry="50" fill="#e0533c" opacity="0.85" />
    <ellipse cx="250" cy="150" rx="50" ry="35" fill="#f97316" opacity="0.75" />
    <circle cx="250" cy="150" r="18" fill="#ffffff" opacity="0.9" />
    <path d="M250,195 Q255,240 250,260" stroke="#3d5243" stroke-width="3" fill="none" />
    <text x="250" y="320" fill="#1e2b22" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">Maple Street</text>
    <text x="250" y="350" fill="#576c5e" font-family="sans-serif" font-size="13" font-weight="500" text-anchor="middle">A lovely avenue with lush trees</text>
    <rect x="225" y="390" width="50" height="3" rx="1.5" fill="#1e2b22" />
    <text x="250" y="440" fill="#8c9d92" font-family="sans-serif" font-size="10" font-weight="700" letter-spacing="3" text-anchor="middle">VERIFIED KNOWLEDGE</text>
  </svg>`,

  'slot-9.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bg9" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#26342b" />
        <stop offset="100%" stop-color="#16201a" />
      </linearGradient>
    </defs>
    <rect width="500" height="500" rx="40" fill="url(#bg9)" />
    <text x="50" y="90" fill="#8da897" font-family="sans-serif" font-size="26" font-weight="800" letter-spacing="2">0316 AVE</text>
    <text x="50" y="230" fill="#ffffff" font-family="sans-serif" font-size="84" font-weight="900" letter-spacing="-2">2K</text>
    <text x="50" y="275" fill="#7a9685" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="2">CONTRIBUTOR</text>
    <text x="50" y="298" fill="#7a9685" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="2">WORLDWIDE</text>
    <rect x="50" y="360" width="400" height="80" rx="16" fill="#1a241e" stroke="#33473a" stroke-width="1" />
    <circle cx="90" cy="400" r="18" fill="#f97316" opacity="0.8" />
    <text x="125" y="405" fill="#d2e2d8" font-family="sans-serif" font-size="13" font-weight="600">Global Compliance Mesh</text>
  </svg>`,

  'slot-10.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bg10" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#111614" />
        <stop offset="100%" stop-color="#1d2822" />
      </linearGradient>
    </defs>
    <rect width="500" height="500" rx="40" fill="url(#bg10)" />
    <rect x="45" y="45" width="120" height="30" rx="15" fill="#f97316" fill-opacity="0.15" stroke="#f97316" stroke-opacity="0.4" />
    <text x="105" y="65" fill="#f97316" font-family="sans-serif" font-size="11" font-weight="800" letter-spacing="1.5" text-anchor="middle">AWS KMS</text>
    <text x="450" y="65" fill="#668071" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="end">AES-256</text>
    <text x="50" y="180" fill="#e8f2ec" font-family="sans-serif" font-size="34" font-weight="800">Data at Rest</text>
    <text x="50" y="220" fill="#829c8d" font-family="sans-serif" font-size="15">Key rotation every 90 days across S3, RDS, &amp; DynamoDB</text>
    <rect x="50" y="300" width="400" height="140" rx="20" fill="#17221b" stroke="#29392e" stroke-width="1.5" />
    <circle cx="100" cy="370" r="24" fill="#25362a" />
    <path d="M95,365 L105,365 L105,378 L95,378 Z" fill="#4ade80" />
    <text x="140" y="365" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="700">Automatic Key Rotation</text>
    <text x="140" y="388" fill="#728c7c" font-family="sans-serif" font-size="12">Zero Downtime · Multi-Region</text>
  </svg>`,

  'slot-11.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bg11" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2b3a31" />
        <stop offset="100%" stop-color="#19231c" />
      </linearGradient>
    </defs>
    <rect width="500" height="500" rx="40" fill="url(#bg11)" />
    <text x="50" y="80" fill="#f97316" font-family="sans-serif" font-size="12" font-weight="800" letter-spacing="3">NATURAL FRESH</text>
    <text x="450" y="80" fill="#829d8d" font-family="sans-serif" font-size="12" font-weight="700" text-anchor="end">THU</text>
    <text x="250" y="240" fill="#ffffff" font-family="sans-serif" font-size="56" font-weight="900" letter-spacing="-1" text-anchor="middle">10x Faster</text>
    <text x="250" y="285" fill="#9cb5a6" font-family="sans-serif" font-size="16" font-weight="500" text-anchor="middle">End-to-End Questionnaire Cycles</text>
    <path d="M80,380 C150,340 250,420 420,350" fill="none" stroke="#f97316" stroke-width="4" stroke-linecap="round" />
    <circle cx="420" cy="350" r="6" fill="#f97316" />
    <text x="250" y="435" fill="#6b8575" font-family="sans-serif" font-size="11" font-weight="700" letter-spacing="2" text-anchor="middle">CONTINUOUS COMPLIANCE</text>
  </svg>`,

  'slot-12.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <rect width="500" height="500" rx="40" fill="#121815" />
    <rect x="30" y="30" width="440" height="440" rx="28" fill="none" stroke="#26362c" stroke-width="1.5" />
    <text x="60" y="85" fill="#688272" font-family="sans-serif" font-size="12" font-weight="700" letter-spacing="2">CITATION ENGINE</text>
    <rect x="340" y="65" width="100" height="26" rx="13" fill="#1b3824" stroke="#2b633d" stroke-width="1" />
    <text x="390" y="82" fill="#4ade80" font-family="sans-serif" font-size="11" font-weight="800" text-anchor="middle">99.8% CONF</text>
    <text x="60" y="180" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="700">Security Policy v3.2</text>
    <text x="60" y="215" fill="#f97316" font-family="sans-serif" font-size="15" font-weight="600">Page 12 · Section 4.3</text>
    <rect x="60" y="260" width="380" height="90" rx="14" fill="#1c2620" />
    <text x="80" y="295" fill="#a6c0b0" font-family="sans-serif" font-size="13" font-style="italic">&ldquo;All customer data encrypted at rest</text>
    <text x="80" y="325" fill="#a6c0b0" font-family="sans-serif" font-size="13" font-style="italic">using KMS hardware modules.&rdquo;</text>
    <text x="250" y="425" fill="#576e60" font-family="sans-serif" font-size="11" font-weight="600" letter-spacing="1.5" text-anchor="middle">FULL AUDIT TRAIL PRESERVED</text>
  </svg>`
};

for (const [filename, content] of Object.entries(cards)) {
  fs.writeFileSync(path.join(dir, filename), content.trim());
}
console.log('Successfully created slots 4 through 12 in ' + dir);
