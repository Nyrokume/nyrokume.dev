export type ColorTheme =
  | "orange"
  | "amber"
  | "coral"
  | "red"
  | "rose"
  | "violet"
  | "blue"
  | "cyan"
  | "mint"
  | "lime";

export type ThemePalette = {
  "--prompt-user": string;
  "--prompt-host": string;
  "--prompt-path": string;
  "--accent": string;
  "--accent-bright": string;
  "--accent-muted": string;
  "--accent-dim": string;
  "--accent-wip": string;
  "--border-accent": string;
  "--scrollbar-thumb": string;
  "--scrollbar-thumb-hover": string;
};

export const COLOR_THEMES: ColorTheme[] = [
  "orange",
  "amber",
  "coral",
  "red",
  "rose",
  "violet",
  "blue",
  "cyan",
  "mint",
  "lime",
];

export const THEME_STORAGE_KEY = "nyrokume-theme";
export const THEME_STYLE_ID = "nyrokume-theme-style";

export const THEME_SWATCHES: Record<ColorTheme, string> = {
  orange: "#ff6b2b",
  amber: "#ffb020",
  coral: "#ff8866",
  red: "#ff5555",
  rose: "#ff79c6",
  violet: "#bd93f9",
  blue: "#5cadff",
  cyan: "#00e5c7",
  mint: "#50fa7b",
  lime: "#b4ff5a",
};

export const THEME_LABELS: Record<ColorTheme, { ru: string; en: string }> = {
  orange: { ru: "оранж", en: "orange" },
  amber: { ru: "янтарь", en: "amber" },
  coral: { ru: "коралл", en: "coral" },
  red: { ru: "красный", en: "red" },
  rose: { ru: "роза", en: "rose" },
  violet: { ru: "фиолет", en: "violet" },
  blue: { ru: "синий", en: "blue" },
  cyan: { ru: "бирюза", en: "cyan" },
  mint: { ru: "мята", en: "mint" },
  lime: { ru: "лайм", en: "lime" },
};

function buildPalette(
  accent: string,
  bright: string,
  dim: string,
  wip: string,
  host: string,
  path?: string,
): ThemePalette {
  return {
    "--prompt-user": accent,
    "--prompt-host": host,
    "--prompt-path": path ?? bright,
    "--accent": accent,
    "--accent-bright": bright,
    "--accent-muted": `${accent}33`,
    "--accent-dim": dim,
    "--accent-wip": wip,
    "--border-accent": `${accent}40`,
    "--scrollbar-thumb": accent,
    "--scrollbar-thumb-hover": bright,
  };
}

export const THEME_PALETTES: Record<ColorTheme, ThemePalette> = {
  orange: buildPalette("#ff6b2b", "#ff8533", "#cc5522", "#ff9944", "#ff9f68"),
  amber: buildPalette("#ffb020", "#ffc857", "#cc8c1a", "#ffd166", "#ffc857"),
  coral: buildPalette("#ff8866", "#ffaa88", "#cc6d52", "#ffb399", "#ffaa88"),
  red: buildPalette("#ff5555", "#ff7a7a", "#cc4444", "#ff8888", "#ff7a7a"),
  rose: buildPalette("#ff79c6", "#ff9fd6", "#cc619e", "#ffb3dd", "#ff9fd6"),
  violet: buildPalette("#bd93f9", "#d6acff", "#9b6fd4", "#caa6ff", "#d6acff", "#ff79c6"),
  blue: buildPalette("#5cadff", "#8bc4ff", "#4a8acc", "#a3cfff", "#8bc4ff"),
  cyan: buildPalette("#00e5c7", "#5eead4", "#00b89e", "#2dd4bf", "#5eead4"),
  mint: buildPalette("#50fa7b", "#7dff9e", "#40c862", "#9effb8", "#7dff9e"),
  lime: buildPalette("#b4ff5a", "#c8ff80", "#8fcc3a", "#d4ff66", "#c8ff80"),
};

export function isColorTheme(value: string | null | undefined): value is ColorTheme {
  return COLOR_THEMES.includes(value as ColorTheme);
}

export function resolveTheme(value: string | null | undefined): ColorTheme {
  return isColorTheme(value) ? value : "orange";
}

function paletteToCss(palette: ThemePalette): string {
  return Object.entries(palette)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}

export function applyTheme(theme: ColorTheme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const palette = THEME_PALETTES[theme];

  root.setAttribute("data-theme", theme);

  let styleNode = document.getElementById(THEME_STYLE_ID);
  if (!styleNode) {
    styleNode = document.createElement("style");
    styleNode.id = THEME_STYLE_ID;
    document.head.appendChild(styleNode);
  }

  styleNode.textContent = `:root,html[data-theme="${theme}"]{${paletteToCss(palette)}}`;

  for (const [key, value] of Object.entries(palette) as [keyof ThemePalette, string][]) {
    root.style.setProperty(key, value);
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", palette["--accent"]);
  }
}

/** Inline boot script — applies saved theme before first paint. */
export function getThemeBootScript(): string {
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var sid=${JSON.stringify(THEME_STYLE_ID)};var o=${JSON.stringify(COLOR_THEMES)};var p=${JSON.stringify(THEME_PALETTES)};var t=localStorage.getItem(k);var theme=o.indexOf(t)>=0?t:"orange";var h=document.documentElement;var c=p[theme];h.setAttribute("data-theme",theme);var d="";for(var x in c)d+=x+":"+c[x]+";";var s=document.getElementById(sid);if(!s){s=document.createElement("style");s.id=sid;document.head.appendChild(s);}s.textContent=":root,html[data-theme=\\""+theme+"\\"]{"+d+"}";for(var y in c)h.style.setProperty(y,c[y]);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",c["--accent"]);}catch(e){}})();`;
}
