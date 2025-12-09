import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MatrixRainConfig, CharsetKey, ThemeKey } from '../types';
import { MatrixRainCore } from '../core/matrixRainCore';
import { EffectRenderer } from '../core/effectRenderer';
import { InteractionHandler } from '../core/interactionHandler';
import { loadConfig, saveConfig, resetConfig as resetConfigService, getDefaultConfig } from '../services/configManager';
import { isMobileDevice } from '../utils';
import { THEMES } from '../config';
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
  // 使用ref跟踪isPaused状态，避免draw函数频繁重新创建
  const isPausedRef = useRef(false);

  // 状态管理
  const [isPaused, setIsPaused] = useState(false);
  const [fps, setFps] = useState(60);
  const [config, setConfig] = useState<MatrixRainConfig>(getDefaultConfig());

  // 使用ref跟踪fps相关状态，避免draw函数频繁重新创建
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // 当isPaused状态变化时，更新ref
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // 配置变化处理
  const handleConfigChange = useCallback((newConfig: Partial<MatrixRainConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    coreRef.current.updateConfig(newConfig);
    if (newConfig.currentTheme) {
      effectRendererRef.current.updateTheme(newConfig.currentTheme);
    }
  }, [config, setConfig, coreRef, effectRendererRef]);

  // 重置配置
  const handleResetConfig = () => {
    resetConfigService();
    const defaultConfig = getDefaultConfig();
    setConfig(defaultConfig);
    coreRef.current.updateConfig(defaultConfig);
    effectRendererRef.current.updateTheme(defaultConfig.currentTheme);
  };

  // 绘制函数
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentConfig = configRef.current;

    // 设置字体
    ctx.font = `bold ${currentConfig.fontSize}px 'Courier New'`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    if (!isPausedRef.current) {
      // 只有在动画运行时才绘制半透明背景和更新FPS
      // 根据主题背景色生成半透明清屏色
      const theme = THEMES[currentConfig.currentTheme];
      const bgColor = theme.background;
      // 从十六进制颜色中提取RGB值
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      // 生成半透明清屏色
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // FPS计算
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;
      frameCountRef.current++;
      
      if (deltaTime >= 1000) {
        const newFps = Math.round((frameCountRef.current * 1000) / deltaTime);
        setFps(newFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
    }

    // 无论是否暂停，都绘制雨滴和效果（暂停时绘制当前状态，不更新）
    coreRef.current.drawDrops(ctx, canvas.height, !isPausedRef.current);
    effectRendererRef.current.renderEffects(ctx, currentConfig.fontSize, currentConfig.currentCharset, !isPausedRef.current);

    if (!isPausedRef.current) {
      animationRef.current = requestAnimationFrame(draw);
    }
  }, [setFps]);

  // 初始化和清理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 加载配置
    const savedConfig = loadConfig();
    let initialConfig = getDefaultConfig();
    
    if (savedConfig) {
      initialConfig = savedConfig;
    }
    
    // 移动设备优化
    if (isMobileDevice()) {
      initialConfig = {
        ...initialConfig,
        density: 70,
        speed: 80,
        fontSize: 20
      };
    }
    
    setConfig(initialConfig);
    coreRef.current.updateConfig(initialConfig);
    effectRendererRef.current.updateTheme(initialConfig.currentTheme);

    // 设置画布尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.background = THEMES[initialConfig.currentTheme].background;

    // 初始化核心
    coreRef.current.initDrops(canvas.width);

    // 启动动画
    animationRef.current = requestAnimationFrame(draw);

    // 事件监听
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        coreRef.current.initDrops(canvas.width);
      }
    };

    // 键盘事件处理
    const handleKeyDown = (e: KeyboardEvent) => {
      // 使用ref获取最新的config和handleConfigChange
      const currentConfig = configRef.current;
      const currentHandleConfigChange = handleConfigChangeRef.current;
      
      switch (e.key) {
        case ' ': {
          // 空格键：暂停/继续
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
        }
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6': {
          // 数字键1-6：切换主题
          const themeIndex = parseInt(e.key) - 1;
          const themes = Object.keys(THEMES) as ThemeKey[];
          if (themeIndex >= 0 && themeIndex < themes.length) {
            currentHandleConfigChange({ currentTheme: themes[themeIndex] });
          }
          break;
        }
        case 'c':
        case 'C': {
          // 字母键C：切换字符集
          const charsets = Object.keys(THEMES) as CharsetKey[];
          const currentCharsetIndex = charsets.indexOf(currentConfig.currentCharset);
          const nextCharsetIndex = (currentCharsetIndex + 1) % charsets.length;
          currentHandleConfigChange({ currentCharset: charsets[nextCharsetIndex] });
          break;
        }
        case 'ArrowUp': {
          // 上箭头：增加字体大小
          e.preventDefault();
          currentHandleConfigChange({ fontSize: Math.min(48, currentConfig.fontSize + 2) });
          break;
        }
        case 'ArrowDown': {
          // 下箭头：减小字体大小
          e.preventDefault();
          currentHandleConfigChange({ fontSize: Math.max(8, currentConfig.fontSize - 2) });
          break;
        }
        case 'ArrowRight': {
          // 右箭头：增加密度
          e.preventDefault();
          currentHandleConfigChange({ density: Math.min(100, currentConfig.density + 5) });
          break;
        }
        case 'ArrowLeft': {
          // 左箭头：减小密度
          e.preventDefault();
          currentHandleConfigChange({ density: Math.max(10, currentConfig.density - 5) });
          break;
        }
        case '+':
        case '=': {
          // 加号：增加速度
          e.preventDefault();
          currentHandleConfigChange({ speed: Math.min(200, currentConfig.speed + 10) });
          break;
        }
        case '-':
        case '_': {
          // 减号：减小速度
          e.preventDefault();
          currentHandleConfigChange({ speed: Math.max(10, currentConfig.speed - 10) });
          break;
        }
        case 't':
        case 'T': {
          // 字母键T：在中心创建文本效果
          if (canvas) {
            interactionHandlerRef.current.createTextEffect(
              canvas.width / 2, 
              canvas.height / 2, 
              'MATRIX'
            );
          }
          break;
        }
        case 'f':
        case 'F': {
          // 字母键F：创建跟随效果
          interactionHandlerRef.current.createFollowEffect();
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  // 使用ref保存最新的config和handleConfigChange，供事件处理函数使用
  const configRef = useRef(config);
  const handleConfigChangeRef = useRef(handleConfigChange);
  
  useEffect(() => {
    configRef.current = config;
    handleConfigChangeRef.current = handleConfigChange;
  }, [config, handleConfigChange]);

  // 保存配置
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // 暂停/继续
  useEffect(() => {
    if (isPaused) {
      // 暂停时取消当前动画帧并重置animationRef
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      // 继续时如果没有动画帧在运行，则重新启动
      if (!animationRef.current) {
        draw();
      }
    }
  }, [isPaused, draw]);

  // 主题变化时更新画布背景
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = THEMES[config.currentTheme].background;
    }
  }, [config.currentTheme]);

  // 当fontSize或density变化时，重新初始化雨滴
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      coreRef.current.initDrops(canvas.width);
    }
  }, [config.fontSize, config.density]);

  // 处理点击
  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    interactionHandlerRef.current.handleClick(x, y, config.currentCharset);
  };

  // 处理触摸点击
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    interactionHandlerRef.current.handleClick(x, y, config.currentCharset);
  };

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    interactionHandlerRef.current.handleMove(x, y);
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    interactionHandlerRef.current.handleMove(x, y);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onClick={handleMouseClick}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          touchAction: 'none',
          userSelect: 'none',
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