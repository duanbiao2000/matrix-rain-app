// 雨滴类型接口
export interface Drop {
  y: number;
  speed: number;
  trail: string[];
  trailLength: number;
  updateCounter: number;
  updateInterval: number;
  currentChar: string;
  xIndex: number;
}

// 交互效果类型
export interface InteractionEffect {
  x: number;
  y: number;
  type: 'ripple' | 'explosion' | 'text' | 'follow';
  life: number;
  maxLife: number;
  radius: number;
  text?: string;
  particles?: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    char: string;
  }[];
  followerCount?: number;
}

// 字符集键类型
export type CharsetKey = keyof typeof import('../config').CHARSETS;

// 主题键类型
export type ThemeKey = keyof typeof import('../config').THEMES;

// 配置接口
export interface MatrixRainConfig {
  currentCharset: CharsetKey;
  currentTheme: ThemeKey;
  fontSize: number;
  density: number;
  speed: number;
  autoOptimize: boolean;
}