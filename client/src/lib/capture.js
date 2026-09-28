const CAPTURE_COLOR_PROPS = [
  "color",
  "backgroundColor",
  "background",
  "backgroundImage",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "outlineColor",
  "outline",
  "textDecorationColor",
  "textDecoration",
  "caretColor",
  "columnRuleColor",
  "fill",
  "stroke",
  "stopColor",
  "boxShadow",
  "textShadow",
  "webkitTextFillColor",
  "webkitTextStrokeColor",
];

function linearToSrgb(x) {
  const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
}

function oklabToRgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function cssNumber(token, pctScale = 1) {
  const t = String(token).trim();
  const n = parseFloat(t);
  if (Number.isNaN(n)) return null;
  return t.endsWith("%") ? (n / 100) * pctScale : n;
}

function cssAngle(token) {
  const t = String(token).trim().toLowerCase();
  const n = parseFloat(t);
  if (Number.isNaN(n)) return null;
  if (t.endsWith("turn")) return n * 360;
  if (t.endsWith("grad")) return n * 0.9;
  if (t.endsWith("rad")) return (n * 180) / Math.PI;
  return n;
}

function rgbString([r, g, b], alphaToken) {
  if (alphaToken) {
    const a = cssNumber(alphaToken);
    if (a !== null && a < 1) return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function convertColorFunction(name, raw) {
  const parts = raw.split("/");
  const tokens = parts[0].trim().split(/\s+/);
  const alpha = parts[1] ? parts[1].trim() : null;
  if (name === "oklch" && tokens.length >= 3) {
    const L = cssNumber(tokens[0]);
    const C = cssNumber(tokens[1], 0.4);
    const H = cssAngle(tokens[2]);
    if (L === null || C === null || H === null) return null;
    const rad = (H * Math.PI) / 180;
    return rgbString(oklabToRgb(L, C * Math.cos(rad), C * Math.sin(rad)), alpha);
  }
  if (name === "oklab" && tokens.length >= 3) {
    const L = cssNumber(tokens[0]);
    const a = cssNumber(tokens[1]);
    const b = cssNumber(tokens[2]);
    if (L === null || a === null || b === null) return null;
    return rgbString(oklabToRgb(L, a, b), alpha);
  }
  return null;
}

function fixUnsupportedColors(value) {
  if (!value || typeof value !== "string" || !/(oklch|oklab)\(/.test(value)) return null;
  const fixed = value.replace(/(oklch|oklab)\(([^()]*)\)/g, (match, name, args) => {
    try {
      return convertColorFunction(name, args) || match;
    } catch {
      return match;
    }
  });
  return fixed === value ? null : fixed;
}

function kebab(prop) {
  return prop
    .replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())
    .replace(/^webkit-/, "-webkit-");
}

const PSEUDO_COLOR_PROPS = [
  "color",
  "backgroundColor",
  "backgroundImage",
  "borderTopColor",
  "borderBottomColor",
  "boxShadow",
];

export function sanitizeCaptureColors(doc) {
  try {
    const win = doc.defaultView || (typeof window !== "undefined" ? window : null);
    if (!win) return;
    const badPseudo = [];
    const nodes = doc.querySelectorAll("*");
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      const cs = win.getComputedStyle(el);
      if (!cs) continue;
      for (let j = 0; j < CAPTURE_COLOR_PROPS.length; j++) {
        const prop = CAPTURE_COLOR_PROPS[j];
        const fixed = fixUnsupportedColors(cs[prop]);
        if (fixed) el.style.setProperty(kebab(prop), fixed, "important");
      }
      const pseudoReads = ["::before", "::after"];
      for (let k = 0; k < pseudoReads.length; k++) {
        const pcs = win.getComputedStyle(el, pseudoReads[k]);
        if (!pcs) continue;
        for (let j = 0; j < PSEUDO_COLOR_PROPS.length; j++) {
          if (fixUnsupportedColors(pcs[PSEUDO_COLOR_PROPS[j]])) {
            badPseudo.push(el);
            break;
          }
        }
      }
    }
    if (badPseudo.length) {
      for (let i = 0; i < badPseudo.length; i++) {
        badPseudo[i].setAttribute("data-h2c-skip-pseudo", "");
      }
      const style = doc.createElement("style");
      style.textContent =
        "[data-h2c-skip-pseudo]::before,[data-h2c-skip-pseudo]::after{content:none!important}";
      (doc.head || doc.documentElement).appendChild(style);
    }
  } catch {
    return;
  }
}
