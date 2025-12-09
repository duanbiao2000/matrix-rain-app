import { CONFIG_STORAGE_KEY } from '../config';
import { MatrixRainConfig, CharsetKey, ThemeKey } from '../types';

/**
 * 加载配置
 */
export const loadConfig = (): MatrixRainConfig | null => {
  try {
    const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig) as MatrixRainConfig;
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
  }
  return null;
};

/**
 * 保存配置
 */
export const saveConfig = (config: MatrixRainConfig): void => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save configuration:', error);
  }
};

/**
 * 重置配置
 */
export const resetConfig = (): void => {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
};

/**
 * 获取默认配置
 */
export const getDefaultConfig = (): MatrixRainConfig => {
  return {
    currentCharset: 'mix' as CharsetKey,
    currentTheme: 'green' as ThemeKey,
    fontSize: 24,
    density: 100,
    speed: 100,
    autoOptimize: true
  };
};