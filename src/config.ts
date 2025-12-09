// 主题配置
export const THEMES = {
  green: {
    primary: '#00ff00',
    secondary: '#00cc00',
    tertiary: '#008800',
    background: '#000000'
  },
  blue: {
    primary: '#00ffff',
    secondary: '#0088ff',
    tertiary: '#0044ff',
    background: '#000022'
  },
  purple: {
    primary: '#ff00ff',
    secondary: '#8800ff',
    tertiary: '#4400ff',
    background: '#110022'
  },
  red: {
    primary: '#ff0000',
    secondary: '#cc0000',
    tertiary: '#880000',
    background: '#220000'
  },
  orange: {
    primary: '#ffaa00',
    secondary: '#cc8800',
    tertiary: '#885500',
    background: '#221100'
  },
  white: {
    primary: '#ffffff',
    secondary: '#cccccc',
    tertiary: '#888888',
    background: '#000000'
  }
} as const;

// 字符集配置
export const CHARSETS = {
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`', // 英文和符号
  cn: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン漢字天地方圓虛空無限未來科技數碼量子', // 日文假名和汉字
  bin: '01', // 二进制字符
  mix: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン漢字レ仮想現実サイバーコード@#$%^&*()[]{}', // 混合字符集
} as const;

// 配置存储键
export const CONFIG_STORAGE_KEY = 'matrixRainConfig';