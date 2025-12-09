import { THEMES, CHARSETS } from '../config';
import { CharsetKey, ThemeKey } from '../types';

/**
 * 获取随机字符
 */
export const getRandomChar = (charsetKey: CharsetKey): string => {
  const charset = CHARSETS[charsetKey] as string;
  return charset[Math.floor(Math.random() * charset.length)];
};

/**
 * 根据强度返回颜色
 */
export const getColorByIntensity = (intensity: number, themeKey: ThemeKey): string => {
  const theme = THEMES[themeKey];
  
  if (intensity > 0.8) {
    return theme.primary;
  } else if (intensity > 0.5) {
    return `${theme.secondary}${Math.floor((0.8 + intensity * 0.2) * 255).toString(16).padStart(2, '0')}`;
  } else if (intensity > 0.2) {
    return `${theme.secondary}${Math.floor((0.5 + intensity * 0.3) * 255).toString(16).padStart(2, '0')}`;
  } else {
    return `${theme.tertiary}${Math.floor(intensity * 0.5 * 255).toString(16).padStart(2, '0')}`;
  }
};

/**
 * 检测是否为移动设备
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};