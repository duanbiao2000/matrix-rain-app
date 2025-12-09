import { InteractionEffect, CharsetKey } from '../types';
import { getRandomChar, isMobileDevice } from '../utils';

/**
 * 交互处理器类
 * 负责处理鼠标、触摸和键盘事件
 */
export class InteractionHandler {
  private mousePosition = { x: 0, y: 0 };
  private onEffectAdd: (effect: InteractionEffect) => void;

  /**
   * 构造函数
   * @param onEffectAdd 效果添加回调函数
   */
  constructor(onEffectAdd: (effect: InteractionEffect) => void) {
    this.onEffectAdd = onEffectAdd;
  }

  /**
   * 处理点击事件
   * @param x 点击X坐标
   * @param y 点击Y坐标
   * @param charset 当前字符集
   */
  handleClick(x: number, y: number, charset: CharsetKey): void {
    // 创建爆炸效果
    const effect: InteractionEffect = {
      x,
      y,
      type: 'explosion',
      life: 1,
      maxLife: 1,
      radius: 10,
      particles: []
    };

    // 生成粒子（移动设备上减少粒子数量以优化性能）
    const particleCount = isMobileDevice() ? 10 : 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Math.random() * 5 + 2;
      effect.particles!.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        char: getRandomChar(charset)
      });
    }

    this.onEffectAdd(effect);
  }

  /**
   * 处理移动事件
   * @param x 移动X坐标
   * @param y 移动Y坐标
   */
  handleMove(x: number, y: number): void {
    // 保存鼠标位置
    this.mousePosition = { x, y };
    
    // 限制涟漪效果的创建频率
    this.onEffectAdd({
      x,
      y,
      type: 'ripple',
      life: 1,
      maxLife: 1,
      radius: 5
    });
  }

  /**
   * 创建文本效果
   * @param x 文本X坐标
   * @param y 文本Y坐标
   * @param text 文本内容
   */
  createTextEffect(x: number, y: number, text: string): void {
    this.onEffectAdd({
      x,
      y,
      type: 'text',
      life: 1,
      maxLife: 1,
      radius: 0,
      text: text
    });
  }

  /**
   * 创建跟随效果
   */
  createFollowEffect(): void {
    this.onEffectAdd({
      x: this.mousePosition.x,
      y: this.mousePosition.y,
      type: 'follow',
      life: 1,
      maxLife: 1,
      radius: 0,
      followerCount: 15
    });
  }

  /**
   * 获取鼠标位置
   */
  getMousePosition() {
    return this.mousePosition;
  }
}