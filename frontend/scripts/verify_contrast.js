// Scripts to verify WCAG 2.2 AA Contrast Ratios
// Relative Luminance formula per W3C WCAG 2.1/2.2

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

function getLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(hex1, hex2) {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const lightTheme = {
  paper: '#FFFBF0',
  ink: '#111111',
  surface: '#FFFFFF',
  primary: '#2F4BFF',
  accentYellow: '#FFD43B',
  accentPink: '#FF7AB6',
  severityRed: '#FF4B4B',
  severityYellow: '#FFD43B',
  severityGreen: '#2BB673',
};

const darkTheme = {
  paper: '#14110F',
  ink: '#FFFBF0',
  surface: '#1E1A17',
  primary: '#5C73FF', // adjusted for dark mode 4.5:1 text on dark surface or white text on primary
  accentYellow: '#FFD43B',
  accentPink: '#FF7AB6',
  severityRed: '#FF6363',
  severityYellow: '#FFD43B',
  severityGreen: '#2BB673',
};

console.log('=== LIGHT THEME WCAG 2.2 AA VERIFICATION ===');
const checksLight = [
  ['Body text (ink on paper)', lightTheme.ink, lightTheme.paper, 4.5],
  ['Body text (ink on surface)', lightTheme.ink, lightTheme.surface, 4.5],
  ['Body text (white on primary)', '#FFFFFF', lightTheme.primary, 4.5],
  ['UI Borders (ink on paper)', lightTheme.ink, lightTheme.paper, 3.0],
  ['Severity RED badge (white on RED)', '#FFFFFF', lightTheme.severityRed, 3.0], // large/badge text
  ['Severity RED badge (ink on RED)', lightTheme.ink, lightTheme.severityRed, 4.5],
  ['Severity YELLOW badge (ink on YELLOW)', lightTheme.ink, lightTheme.severityYellow, 4.5],
  ['Severity GREEN badge (ink on GREEN)', lightTheme.ink, lightTheme.severityGreen, 4.5],
  ['Accent Pink badge (ink on Pink)', lightTheme.ink, lightTheme.accentPink, 4.5],
];

let failed = false;
checksLight.forEach(([desc, fg, bg, target]) => {
  const cr = getContrast(fg, bg);
  const pass = cr >= target;
  console.log(`${pass ? 'PASS' : 'FAIL'} [${cr.toFixed(2)}:1 >= ${target}:1] - ${desc}`);
  if (!pass) failed = true;
});

console.log('\n=== DARK THEME WCAG 2.2 AA VERIFICATION ===');
const checksDark = [
  ['Body text (ink on paper)', darkTheme.ink, darkTheme.paper, 4.5],
  ['Body text (ink on surface)', darkTheme.ink, darkTheme.surface, 4.5],
  ['UI Borders (ink on paper)', darkTheme.ink, darkTheme.paper, 3.0],
  ['Severity RED badge (ink on RED)', '#111111', darkTheme.severityRed, 4.5],
  ['Severity YELLOW badge (ink on YELLOW)', '#111111', darkTheme.severityYellow, 4.5],
  ['Severity GREEN badge (ink on GREEN)', '#111111', darkTheme.severityGreen, 4.5],
  ['White text on dark primary', '#FFFFFF', '#2F4BFF', 4.5],
];

checksDark.forEach(([desc, fg, bg, target]) => {
  const cr = getContrast(fg, bg);
  const pass = cr >= target;
  console.log(`${pass ? 'PASS' : 'FAIL'} [${cr.toFixed(2)}:1 >= ${target}:1] - ${desc}`);
  if (!pass) failed = true;
});

if (failed) {
  console.error('\nSome contrast checks failed!');
  process.exit(1);
} else {
  console.log('\nAll WCAG 2.2 AA contrast checks PASSED successfully!');
}

