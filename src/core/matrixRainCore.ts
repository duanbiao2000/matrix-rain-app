import { Drop, CharsetKey, ThemeKey } from '../types';
import { getRandomChar, getColorByIntensity } from '../utils';

/**
 * 矩阵雨动画核心类
 * 负责雨滴的初始化、绘制和更新
 */
export class MatrixRainCore {
  private drops: Drop[] = [];
  private fontSize: number = 24;
  private density: number = 100;
  private speed: number = 100;
  private currentCharset: CharsetKey = 'mix';
  private currentTheme: ThemeKey = 'green';

  /**
   * 初始化雨滴
   * @param canvasWidth 画布宽度
   */
  initDrops(canvasWidth: number): void {
    const columns = Math.ceil(canvasWidth / this.fontSize);
    const actualColumns = Math.max(1, Math.floor(columns * (this.density / 100)));
    
    // 创建随机索引数组，用于选择要显示的列
    const allIndices = Array.from({ length: columns }, (_, i) => i);
    const selectedIndices: number[] = [];
    
    for (let i = 0; i < actualColumns; i++) {
      const randomIndex = Math.floor(Math.random() * allIndices.length);
      selectedIndices.push(allIndices.splice(randomIndex, 1)[0]);
    }
    
    const currentSpeedRatio = this.speed / 100;
    this.drops = selectedIndices.map(index => ({
      y: Math.random() * canvasWidth,
      speed: (Math.random() * 2 + 1.5) * currentSpeedRatio,
      trail: [],
      trailLength: 8,
      updateCounter: 0,
      updateInterval: Math.floor(Math.random() * 4) + 3,
      currentChar: getRandomChar(this.currentCharset),
      xIndex: index,
    }));
    
    // 预填充尾迹
    this.drops.forEach(drop => {
      for (let i = 0; i < drop.trailLength; i++) {
        drop.trail.push(getRandomChar(this.currentCharset));
      }
    });
  }

  /**
   * 绘制雨滴
   * @param ctx Canvas 2D上下文
   * @param canvasHeight 画布高度
   * @param isAnimating 是否正在动画（true为正常动画，false为暂停状态）
   */
  drawDrops(ctx: CanvasRenderingContext2D, canvasHeight: number, isAnimating: boolean): void {
    for (let i = 0; i < this.drops.length; i++) {
      const drop = this.drops[i];
      const x = drop.xIndex * this.fontSize;

      // 绘制尾迹
      for (let j = 0; j < drop.trail.length; j++) {
        const trailY = drop.y - (j + 1) * this.fontSize;
        if (trailY + this.fontSize < 0) continue;

        const intensity = 1 - j / drop.trailLength;
        ctx.fillStyle = getColorByIntensity(intensity, this.currentTheme);
        ctx.fillText(drop.trail[j], x, trailY);
      }

      // 绘制当前字符
      ctx.fillStyle = getColorByIntensity(1, this.currentTheme);
      ctx.fillText(drop.currentChar, x, drop.y);

      if (isAnimating) {
        // 更新字符（仅在动画状态）
        drop.updateCounter++;
        if (drop.updateCounter >= drop.updateInterval) {
          drop.updateCounter = 0;
          drop.trail.unshift(drop.currentChar);
          if (drop.trail.length > drop.trailLength) drop.trail.pop();
          drop.currentChar = getRandomChar(this.currentCharset);
        }

        // 移动雨滴（仅在动画状态）
        drop.y += drop.speed;

        // 循环重置（仅在动画状态）
        if (drop.y > canvasHeight) {
          drop.y = -drop.trailLength * this.fontSize;
          drop.speed = (Math.random() * 2 + 1.5) * (this.speed / 100);
          drop.updateCounter = 0;
          drop.updateInterval = Math.floor(Math.random() * 4) + 3;
          drop.currentChar = getRandomChar(this.currentCharset);
          drop.trail = [];
        }
      }
    }
  }

  /**
   * 更新配置
   * @param config 配置对象
   */
  updateConfig(config: Partial<{
    fontSize: number;
    density: number;
    speed: number;
    currentCharset: CharsetKey;
    currentTheme: ThemeKey;
  }>): void {
    if (config.fontSize !== undefined) {
      this.fontSize = config.fontSize;
    }
    if (config.density !== undefined) {
      this.density = config.density;
    }
    if (config.speed !== undefined) {
      this.speed = config.speed;
      this.drops.forEach(drop => {
        drop.speed = (Math.random() * 2 + 1.5) * (this.speed / 100);
      });
    }
    if (config.currentCharset !== undefined) {
      this.currentCharset = config.currentCharset;
      this.drops.forEach(drop => {
        drop.currentChar = getRandomChar(this.currentCharset);
        drop.trail = Array(drop.trailLength).fill(0).map(() => getRandomChar(this.currentCharset));
        drop.updateCounter = drop.updateInterval;
      });
    }
    if (config.currentTheme !== undefined) {
      this.currentTheme = config.currentTheme;
    }
  }

  /**
   * 获取当前雨滴数组
   */
  getDrops(): Drop[] {
    return this.drops;
  }
}