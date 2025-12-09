import { InteractionEffect, CharsetKey, ThemeKey } from '../types';
import { getRandomChar } from '../utils';
import { THEMES } from '../config';

/**
 * 效果渲染器类
 * 负责各种交互效果的渲染和更新
 */
export class EffectRenderer {
  private effects: InteractionEffect[] = [];
  private currentTheme: ThemeKey = 'green';

  /**
   * 添加交互效果
   * @param effect 交互效果对象
   */
  addEffect(effect: InteractionEffect): void {
    this.effects.push(effect);
  }

  /**
   * 绘制和更新交互效果
   * @param ctx Canvas 2D上下文
   * @param fontSize 当前字体大小
   * @param charset 当前字符集
   * @param isAnimating 是否正在动画（true为正常动画，false为暂停状态）
   */
  renderEffects(ctx: CanvasRenderingContext2D, fontSize: number, charset: CharsetKey, isAnimating: boolean): void {
    const theme = THEMES[this.currentTheme];
    const themePrimary = theme.primary;
    
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      const alpha = effect.life / effect.maxLife;
      
      if (effect.type === 'ripple') {
        if (isAnimating) {
          // 更新涟漪（仅在动画状态）
          effect.life -= 0.02;
          effect.radius += 3;
          
          if (alpha <= 0) {
            this.effects.splice(i, 1);
            continue;
          }
        }
        
        // 绘制涟漪
        ctx.strokeStyle = `${themePrimary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
      } 
      else if (effect.type === 'explosion') {
        if (isAnimating) {
          // 更新爆炸效果（仅在动画状态）
          effect.life -= 0.03;
          
          if (alpha <= 0) {
            this.effects.splice(i, 1);
            continue;
          }
        }
        
        // 更新和绘制粒子
        if (effect.particles) {
          for (const particle of effect.particles) {
            if (isAnimating) {
              // 更新粒子（仅在动画状态）
              particle.x += particle.vx;
              particle.y += particle.vy;
              particle.vy += 0.2; // 重力
              particle.life -= 0.03;
            }
            
            // 绘制粒子
            const particleAlpha = particle.life / particle.maxLife;
            if (particleAlpha > 0) {
              ctx.fillStyle = `${themePrimary}${Math.floor(particleAlpha * 255).toString(16).padStart(2, '0')}`;
              ctx.fillText(particle.char, particle.x, particle.y);
            }
          }
        }
      }
      else if (effect.type === 'text') {
        if (isAnimating) {
          // 更新文本效果（仅在动画状态）
          effect.life -= 0.015;
          
          if (alpha <= 0 || !effect.text) {
            this.effects.splice(i, 1);
            continue;
          }
        }
        
        // 绘制文本
        ctx.font = `bold ${fontSize + 10}px 'Courier New'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `${themePrimary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fillText(effect.text as string, effect.x, effect.y);
        ctx.textAlign = 'left'; // 恢复默认文本对齐
        ctx.textBaseline = 'top'; // 恢复默认文本基线
      }
      else if (effect.type === 'follow') {
        if (isAnimating) {
          // 更新跟随效果（仅在动画状态）
          effect.life -= 0.01;
          
          if (alpha <= 0) {
            this.effects.splice(i, 1);
            continue;
          }
        }
        
        // 绘制跟随字符
        const followerCount = effect.followerCount || 10;
        for (let j = 0; j < followerCount; j++) {
          const followerAlpha = alpha * (1 - j / followerCount);
          if (followerAlpha <= 0) continue;
          
          const followerX = effect.x + Math.sin(j) * 10;
          const followerY = effect.y + j * 15;
          
          ctx.fillStyle = `${themePrimary}${Math.floor(followerAlpha * 255).toString(16).padStart(2, '0')}`;
          ctx.fillText(getRandomChar(charset), followerX, followerY);
        }
      }
    }
  }

  /**
   * 更新主题
   * @param theme 主题键
   */
  updateTheme(theme: ThemeKey): void {
    this.currentTheme = theme;
  }

  /**
   * 清除所有效果
   */
  clearEffects(): void {
    this.effects = [];
  }
}