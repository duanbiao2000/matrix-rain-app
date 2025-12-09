# MatrixRain 组件化拆分分析

## 1. 当前代码结构分析

### 1.1 代码规模与复杂性
- **文件大小**: 约1159行代码
- **功能模块**: 包含动画渲染、交互处理、配置管理、UI控制面板等多个功能
- **状态管理**: 使用React hooks管理多个状态变量
- **类型定义**: 包含5个接口/类型定义

### 1.2 违反SOLID原则的问题

#### 1.2.1 单一职责原则(SRP)
- 一个组件承担了太多职责：动画渲染、事件处理、配置管理、UI展示
- 代码逻辑高度耦合，修改一个功能可能影响其他功能

#### 1.2.2 开放封闭原则(OCP)
- 新功能扩展需要修改核心文件
- 缺少扩展点，难以添加新的交互效果或主题

#### 1.2.3 里氏替换原则(LSP)
- 无明显违反，但组件结构复杂导致难以替换或扩展

#### 1.2.4 接口隔离原则(ISP)
- 所有功能都集中在一个组件中，没有提供细粒度的接口

#### 1.2.5 依赖倒置原则(DIP)
- 组件直接依赖于具体实现，而非抽象
- 缺少依赖注入机制，难以进行单元测试

## 2. 组件化拆分建议

### 2.1 拆分策略

| 模块类型 | 模块名称 | 职责范围 | 文件位置 |
|---------|---------|---------|---------|
| 类型定义 | types | 所有TypeScript接口和类型定义 | src/types/index.ts |
| 工具函数 | utils | 通用工具函数（随机字符生成、颜色计算等） | src/utils/index.ts |
| 配置管理 | configManager | 配置的加载、保存、重置 | src/services/configManager.ts |
| 动画核心 | matrixRainCore | 雨滴初始化、绘制、更新逻辑 | src/core/matrixRainCore.ts |
| 交互处理 | interactionHandler | 鼠标、触摸、键盘事件处理 | src/core/interactionHandler.ts |
| 效果渲染 | effectRenderer | 各种交互效果的渲染 | src/core/effectRenderer.ts |
| UI组件 | ControlPanel | 控制面板UI组件 | src/components/ControlPanel.tsx |
| 主组件 | MatrixRain | 整合所有模块的主组件 | src/components/MatrixRain.tsx |

### 2.2 详细拆分方案

#### 2.2.1 类型定义模块 (`src/types/index.ts`)
```typescript
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
```

#### 2.2.2 工具函数模块 (`src/utils/index.ts`)
```typescript
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
```

#### 2.2.3 配置管理模块 (`src/services/configManager.ts`)
```typescript
import { CONFIG_STORAGE_KEY } from '../config';
import { MatrixRainConfig } from '../types';

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
    currentCharset: 'mix',
    currentTheme: 'green',
    fontSize: 24,
    density: 100,
    speed: 100,
    autoOptimize: true
  };
};
```

#### 2.2.4 动画核心模块 (`src/core/matrixRainCore.ts`)
```typescript
import { Drop, CharsetKey, ThemeKey } from '../types';
import { getRandomChar, getColorByIntensity } from '../utils';
import { THEMES } from '../config';

export class MatrixRainCore {
  private drops: Drop[] = [];
  private fontSize: number = 24;
  private density: number = 100;
  private speed: number = 100;
  private currentCharset: CharsetKey = 'mix';
  private currentTheme: ThemeKey = 'green';

  /**
   * 初始化雨滴
   */
  initDrops(canvasWidth: number): void {
    const columns = Math.ceil(canvasWidth / this.fontSize);
    const actualColumns = Math.max(1, Math.floor(columns * (this.density / 100)));
    
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
    
    this.drops.forEach(drop => {
      for (let i = 0; i < drop.trailLength; i++) {
        drop.trail.push(getRandomChar(this.currentCharset));
      }
    });
  }

  /**
   * 绘制雨滴
   */
  drawDrops(ctx: CanvasRenderingContext2D, canvasHeight: number): void {
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

      // 更新字符
      drop.updateCounter++;
      if (drop.updateCounter >= drop.updateInterval) {
        drop.updateCounter = 0;
        drop.trail.unshift(drop.currentChar);
        if (drop.trail.length > drop.trailLength) drop.trail.pop();
        drop.currentChar = getRandomChar(this.currentCharset);
      }

      // 移动
      drop.y += drop.speed;

      // 循环重置
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

  /**
   * 更新配置
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
   * 获取当前雨滴
   */
  getDrops(): Drop[] {
    return this.drops;
  }
}
```

#### 2.2.5 交互效果模块 (`src/core/effectRenderer.ts`)
```typescript
import { InteractionEffect, CharsetKey, ThemeKey } from '../types';
import { getRandomChar } from '../utils';
import { THEMES } from '../config';

export class EffectRenderer {
  private effects: InteractionEffect[] = [];
  private currentTheme: ThemeKey = 'green';

  /**
   * 添加交互效果
   */
  addEffect(effect: InteractionEffect): void {
    this.effects.push(effect);
  }

  /**
   * 绘制和更新交互效果
   */
  renderEffects(ctx: CanvasRenderingContext2D, fontSize: number, charset: CharsetKey): void {
    const themePrimary = THEMES[this.currentTheme].primary;
    
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      const alpha = effect.life / effect.maxLife;
      
      if (effect.type === 'ripple') {
        // 更新涟漪
        effect.life -= 0.02;
        effect.radius += 3;
        
        if (alpha <= 0) {
          this.effects.splice(i, 1);
          continue;
        }
        
        // 绘制涟漪
        ctx.strokeStyle = `${themePrimary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
      } 
      else if (effect.type === 'explosion') {
        // 更新爆炸效果
        effect.life -= 0.03;
        
        if (alpha <= 0) {
          this.effects.splice(i, 1);
          continue;
        }
        
        // 更新粒子
        if (effect.particles) {
          for (const particle of effect.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // 重力
            particle.life -= 0.03;
            
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
        // 更新文本效果
        effect.life -= 0.015;
        
        if (alpha <= 0 || !effect.text) {
          this.effects.splice(i, 1);
          continue;
        }
        
        // 绘制文本
        ctx.font = `bold ${fontSize + 10}px 'Courier New'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `${themePrimary}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fillText(effect.text, effect.x, effect.y);
        ctx.textAlign = 'left'; // 恢复默认文本对齐
        ctx.textBaseline = 'top'; // 恢复默认文本基线
      }
    }
  }

  /**
   * 更新主题
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
```

#### 2.2.6 交互处理模块 (`src/core/interactionHandler.ts`)
```typescript
import { InteractionEffect, CharsetKey } from '../types';
import { getRandomChar, isMobileDevice } from '../utils';

export class InteractionHandler {
  private mousePosition = { x: 0, y: 0 };
  private onEffectAdd: (effect: InteractionEffect) => void;

  constructor(onEffectAdd: (effect: InteractionEffect) => void) {
    this.onEffectAdd = onEffectAdd;
  }

  /**
   * 处理点击事件
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
   */
  handleMove(x: number, y: number): void {
    // 保存鼠标位置
    this.mousePosition = { x, y };
    
    // 限制涟漪效果的创建频率
    // 这里可以添加更复杂的频率控制逻辑
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
   * 获取鼠标位置
   */
  getMousePosition() {
    return this.mousePosition;
  }
}
```

#### 2.2.7 控制面板组件 (`src/components/ControlPanel.tsx`)
```typescript
import React from 'react';
import { MatrixRainConfig, CharsetKey, ThemeKey } from '../types';

interface ControlPanelProps {
  config: MatrixRainConfig;
  isPaused: boolean;
  fps: number;
  onConfigChange: (config: Partial<MatrixRainConfig>) => void;
  onTogglePause: () => void;
  onResetConfig: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  isPaused,
  fps,
  onConfigChange,
  onTogglePause,
  onResetConfig
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        background: 'rgba(0, 20, 10, 0.7)',
        padding: '10px',
        border: '1px solid #0a0',
        borderRadius: '5px',
        fontFamily: '"Courier New", monospace',
        color: '#0f0',
      }}
    >
      <button
        onClick={onTogglePause}
        style={{
          background: '#000',
          color: '#0f0',
          border: '1px solid #0a0',
          padding: '4px 8px',
          margin: '4px',
          cursor: 'pointer',
          fontFamily: 'monospace',
        }}
      >
        {isPaused ? '▶ 继续' : '⏸ 暂停'} FPS: {fps}
      </button>

      <select
        value={config.currentCharset}
        onChange={(e) => onConfigChange({ currentCharset: e.target.value as CharsetKey })}
        style={{
          background: '#000',
          color: '#0f0',
          border: '1px solid #0a0',
          padding: '4px 8px',
          margin: '4px',
          fontFamily: 'monospace',
        }}
      >
        <option value="en">英文+符号</option>
        <option value="cn">中文+日文</option>
        <option value="bin">二进制 (0/1)</option>
        <option value="mix">混合字符</option>
      </select>

      <select
        value={config.currentTheme}
        onChange={(e) => onConfigChange({ currentTheme: e.target.value as ThemeKey })}
        style={{
          background: '#000',
          color: '#0f0',
          border: '1px solid #0a0',
          padding: '4px 8px',
          margin: '4px',
          fontFamily: 'monospace',
        }}
      >
        <option value="green">经典绿色</option>
        <option value="blue">科技蓝</option>
        <option value="purple">神秘紫</option>
        <option value="red">警示红</option>
        <option value="orange">温暖橙</option>
        <option value="white">简洁白</option>
      </select>

      {/* 字体大小滑块 */}
      <div style={{ margin: '8px 4px', display: 'flex', alignItems: 'center' }}>
        <label style={{ color: '#0f0', fontFamily: 'monospace', marginRight: '8px' }}>
          字体大小: {config.fontSize}px
        </label>
        <input
          type="range"
          min="8"
          max="48"
          value={config.fontSize}
          onChange={(e) => onConfigChange({ fontSize: Number(e.target.value) })}
          style={{
            background: '#000',
            color: '#0f0',
            border: '1px solid #0a0',
            padding: '4px 8px',
            margin: '4px',
            outline: 'none',
          }}
        />
      </div>

      {/* 雨滴密度滑块 */}
      <div style={{ margin: '8px 4px', display: 'flex', alignItems: 'center' }}>
        <label style={{ color: '#0f0', fontFamily: 'monospace', marginRight: '8px' }}>
          雨滴密度: {config.density}%
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={config.density}
          onChange={(e) => onConfigChange({ density: Number(e.target.value) })}
          style={{
            background: '#000',
            color: '#0f0',
            border: '1px solid #0a0',
            padding: '4px 8px',
            margin: '4px',
            outline: 'none',
          }}
        />
      </div>

      {/* 速度滑块 */}
      <div style={{ margin: '8px 4px', display: 'flex', alignItems: 'center' }}>
        <label style={{ color: '#0f0', fontFamily: 'monospace', marginRight: '8px' }}>
          下落速度: {config.speed}%
        </label>
        <input
          type="range"
          min="10"
          max="200"
          value={config.speed}
          onChange={(e) => onConfigChange({ speed: Number(e.target.value) })}
          style={{
            background: '#000',
            color: '#0f0',
            border: '1px solid #0a0',
            padding: '4px 8px',
            margin: '4px',
            outline: 'none',
          }}
        />
      </div>

      {/* 自动性能优化开关 */}
      <div style={{ margin: '8px 4px', display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={config.autoOptimize}
          onChange={(e) => onConfigChange({ autoOptimize: e.target.checked })}
          style={{
            marginRight: '8px',
            accentColor: '#0f0',
          }}
        />
        <label style={{ color: '#0f0', fontFamily: 'monospace' }}>
          自动性能优化
        </label>
      </div>

      {/* 重置配置按钮 */}
      <button
        onClick={onResetConfig}
        style={{
          background: '#000',
          color: '#0f0',
          border: '1px solid #0a0',
          padding: '4px 8px',
          margin: '4px',
          cursor: 'pointer',
          fontFamily: 'monospace',
        }}
      >
        重置配置
      </button>
    </div>
  );
};

export default ControlPanel;
```

#### 2.2.7 主组件 (`src/components/MatrixRain.tsx`)
```typescript
import React, { useEffect, useRef, useState } from 'react';
import { MatrixRainConfig } from '../types';
import { MatrixRainCore } from '../core/matrixRainCore';
import { EffectRenderer } from '../core/effectRenderer';
import { InteractionHandler } from '../core/interactionHandler';
import { loadConfig, saveConfig, resetConfig as resetConfigService, getDefaultConfig } from '../services/configManager';
import { isMobileDevice } from '../utils';
import ControlPanel from './ControlPanel';

const MatrixRain: React.FC = () => {
  // Canvas引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 动画帧ID引用
  const animationRef = useRef<number | null>(null);
  // 核心动画实例
  const coreRef = useRef<MatrixRainCore>(new MatrixRainCore());
  // 效果渲染实例
  const effectRendererRef = useRef<EffectRenderer>(new EffectRenderer());
  // 交互处理实例
  const interactionHandlerRef = useRef<InteractionHandler>(
    new InteractionHandler((effect) => effectRendererRef.current.addEffect(effect))
  );

  // 状态管理
  const [isPaused, setIsPaused] = useState(false);
  const [fps, setFps] = useState(60);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());
  const [config, setConfig] = useState<MatrixRainConfig>(getDefaultConfig());

  // 配置变化处理
  const handleConfigChange = (newConfig: Partial<MatrixRainConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    coreRef.current.updateConfig(newConfig);
    if (newConfig.currentTheme) {
      effectRendererRef.current.updateTheme(newConfig.currentTheme);
    }
  };

  // 重置配置
  const handleResetConfig = () => {
    resetConfigService();
    const defaultConfig = getDefaultConfig();
    setConfig(defaultConfig);
    coreRef.current.updateConfig(defaultConfig);
    effectRendererRef.current.updateTheme(defaultConfig.currentTheme);
  };

  // 绘制函数
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清屏
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // FPS计算
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    setFrameCount(prev => prev + 1);
    
    if (deltaTime >= 1000) {
      const newFps = Math.round((frameCount * 1000) / deltaTime);
      setFps(newFps);
      setFrameCount(0);
      setLastTime(currentTime);
    }

    // 设置字体
    ctx.font = `bold ${config.fontSize}px 'Courier New'`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 绘制雨滴
    coreRef.current.drawDrops(ctx, canvas.height);
    
    // 绘制交互效果
    effectRendererRef.current.renderEffects(ctx, config.fontSize, config.currentCharset);

    if (!isPaused) {
      animationRef.current = requestAnimationFrame(draw);
    }
  };

  // 初始化和清理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 加载配置
    const savedConfig = loadConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      coreRef.current.updateConfig(savedConfig);
      effectRendererRef.current.updateTheme(savedConfig.currentTheme);
    }

    // 移动设备优化
    if (isMobileDevice()) {
      const mobileConfig = {
        density: 70,
        speed: 80,
        fontSize: 20
      };
      setConfig(prev => ({ ...prev, ...mobileConfig }));
      coreRef.current.updateConfig(mobileConfig);
    }

    // 设置画布尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 初始化核心
    coreRef.current.updateConfig(config);
    coreRef.current.initDrops(canvas.width);

    // 启动动画
    draw();

    // 事件监听
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        coreRef.current.initDrops(canvas.width);
      }
    };

    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 保存配置
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // 暂停/继续
  useEffect(() => {
    if (!isPaused && !animationRef.current) {
      draw();
    }
  }, [isPaused]);

  // 处理点击
  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    interactionHandlerRef.current.handleClick(x, y, config.currentCharset);
  };

  // 处理移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    interactionHandlerRef.current.handleMove(x, y);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onClick={handleMouseClick}
        onMouseMove={handleMouseMove}
        style={{
          display: 'block',
          background: '#000',
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
        }}
      />

      <ControlPanel
        config={config}
        isPaused={isPaused}
        fps={fps}
        onConfigChange={handleConfigChange}
        onTogglePause={() => setIsPaused(prev => !prev)}
        onResetConfig={handleResetConfig}
      />
    </div>
  );
};

export default MatrixRain;
```

## 3. 拆分后的优势

### 3.1 代码质量提升
- **单一职责**: 每个模块只负责一个特定功能
- **可维护性**: 代码结构清晰，易于理解和修改
- **可测试性**: 每个模块可以独立进行单元测试
- **可读性**: 模块化结构提高代码可读性

### 3.2 开发效率提升
- **并行开发**: 多个开发者可以同时开发不同模块
- **功能复用**: 核心逻辑可以在其他项目中复用
- **快速定位问题**: 问题定位更加精确

### 3.3 扩展性增强
- **易于添加新功能**: 新功能可以通过扩展现有模块或添加新模块实现
- **支持插件化**: 可以通过插件机制添加新的交互效果或主题
- **配置驱动**: 配置管理模块支持动态配置

### 3.4 性能优化
- **按需加载**: 可以根据需要加载不同模块
- **内存管理**: 更好的内存管理，减少内存泄漏风险
- **渲染优化**: 更高效的渲染逻辑

## 4. 实施建议

### 4.1 实施步骤
1. 首先创建所需的目录结构
2. 提取类型定义到`src/types/index.ts`
3. 提取工具函数到`src/utils/index.ts`
4. 实现配置管理模块
5. 实现核心动画模块
6. 实现效果渲染模块
7. 实现交互处理模块
8. 实现控制面板组件
9. 重构主组件，整合所有模块
10. 测试和优化

### 4.2 注意事项
- 确保模块间的依赖关系清晰
- 使用TypeScript接口定义模块间的通信协议
- 编写单元测试确保每个模块的正确性
- 保持代码风格一致
- 文档化每个模块的功能和使用方法

## 5. 结论

通过组件化拆分，MatrixRain组件将更加符合SOLID原则，具有更好的可维护性、可扩展性和可测试性。拆分后的代码结构清晰，职责分明，能够支持未来的功能扩展和性能优化。这种模块化设计也为团队协作提供了更好的支持，提高了开发效率和代码质量。