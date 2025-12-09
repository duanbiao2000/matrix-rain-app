import React, { useEffect, useRef, useState } from 'react';

// 定义雨滴类型接口
interface Drop {
  y: number;
  speed: number;
  trail: string[];
  trailLength: number;
  updateCounter: number;
  updateInterval: number;
  currentChar: string;
}

// ===========================================
// MatrixRain - 黑客帝国数字雨效果组件
// ===========================================
// 实现了经典的"数字雨"动画效果，包含以下核心功能：
// 1. 动态下落的字符流，带有渐变透明度效果
// 2. 可切换的字符集（英文、中文/日文、二进制、混合）
// 3. 动画暂停/继续控制
// 4. 响应式画布大小调整
// 5. 性能优化的动画循环

// 字符集配置 - 使用const断言确保类型安全
const CHARSETS = {
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`', // 英文和符号
  cn: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン漢字天地方圓虛空無限未來科技數碼量子', // 日文假名和汉字
  bin: '01', // 二进制字符
  mix: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン漢字レ仮想現実サイバーコード@#$%^&*()[]{}', // 混合字符集
} as const;

// 字符集键类型 - 从CHARSETS对象自动推断，确保类型安全
type CharsetKey = keyof typeof CHARSETS;

// MatrixRain组件定义 - 无props的React函数组件
const MatrixRain: React.FC = () => {
  // Canvas引用 - 用于获取DOM元素和2D渲染上下文
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 动画帧ID引用 - 用于控制requestAnimationFrame的启动和取消
  const animationRef = useRef<number | null>(null);
  
  // 雨滴数组引用 - 存储所有雨滴的状态信息
  const dropsRef = useRef<Drop[]>([]);
  
  // 暂停状态引用 - 用于在draw函数中快速检查暂停状态
  const isPausedRef = useRef(false);

  // 组件状态 - 控制UI显示和用户交互
  const [isPaused, setIsPaused] = useState(false); // 动画暂停状态
  const [currentCharset, setCurrentCharset] = useState<CharsetKey>('mix'); // 当前使用的字符集
  
  // 使用ref存储当前字符集，确保getRandomChar始终能访问到最新值
  const currentCharsetRef = useRef<CharsetKey>(currentCharset);

  // 配置常量 - 字体大小（像素）
  const fontSize = 24;

  // 获取随机字符
  const getRandomChar = () => {
    // 获取当前字符集，使用ref确保始终访问最新值
    const charset = CHARSETS[currentCharsetRef.current] as string;
    return charset[Math.floor(Math.random() * charset.length)];
  };

  // 根据强度返回颜色
  const getColorByIntensity = (intensity: number) => {
    if (intensity > 0.8) {
      return `rgba(0, 255, 0, 1)`;
    } else if (intensity > 0.5) {
      return `rgba(0, 255, 100, ${0.8 + intensity * 0.2})`;
    } else if (intensity > 0.2) {
      return `rgba(0, 200, 100, ${0.5 + intensity * 0.3})`;
    } else {
      return `rgba(0, 100, 50, ${intensity * 0.5})`;
    }
  };

  // 初始化雨滴
  const initDrops = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const columns = Math.ceil(canvas.width / fontSize);
    const newDrops = Array(columns).fill(0).map(() => ({
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 1.5,
      trail: [] as string[],
      trailLength: 8,
      updateCounter: 0,
      updateInterval: Math.floor(Math.random() * 4) + 3,
      currentChar: getRandomChar(),
    }));

    // 预填充尾迹
    newDrops.forEach(drop => {
      for (let i = 0; i < drop.trailLength; i++) {
        drop.trail.push(getRandomChar());
      }
    });

    dropsRef.current = newDrops;
  };

  // 绘制一帧
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 半透明清屏
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `bold ${fontSize}px 'Courier New'`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const drops = dropsRef.current;
    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      const x = i * fontSize;

      // 绘制尾迹
      for (let j = 0; j < drop.trail.length; j++) {
        const trailY = drop.y - (j + 1) * fontSize;
        if (trailY + fontSize < 0) continue;

        const intensity = 1 - j / drop.trailLength;
        ctx.fillStyle = getColorByIntensity(intensity);
        ctx.fillText(drop.trail[j], x, trailY);
      }

      // 绘制当前字符
      ctx.fillStyle = getColorByIntensity(1);
      ctx.fillText(drop.currentChar, x, drop.y);

      // 更新字符（按频率）
      drop.updateCounter++;
      if (drop.updateCounter >= drop.updateInterval) {
        drop.updateCounter = 0;
        drop.trail.unshift(drop.currentChar);
        if (drop.trail.length > drop.trailLength) drop.trail.pop();
        drop.currentChar = getRandomChar();
      }

      // 移动
      drop.y += drop.speed;

      // 循环重置
      if (drop.y > canvas.height) {
        drop.y = -drop.trailLength * fontSize;
        drop.speed = Math.random() * 2 + 1.5;
        drop.updateCounter = 0;
        drop.updateInterval = Math.floor(Math.random() * 4) + 3;
        drop.currentChar = getRandomChar();
        drop.trail = [];
      }
    }

    if (!isPausedRef.current) {
      animationRef.current = requestAnimationFrame(draw);
    }
  };

  /**
   * 响应式调整画布大小
   * 使用防抖(debounce)技术减少resize事件的触发频率，优化性能
   */
  // 防抖计时器引用 - 使用number类型替代NodeJS.Timeout
  const debounceResize = useRef<number | null>(null);
  
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 如果已有计时器，清除它
    if (debounceResize.current) {
      clearTimeout(debounceResize.current);
    }
    
    // 设置新的计时器，200ms后执行实际的resize操作
    debounceResize.current = window.setTimeout(() => {
      canvas.width = window.innerWidth; // 更新画布宽度
      canvas.height = window.innerHeight; // 更新画布高度
      initDrops(); // 重新初始化雨滴
    }, 200);
  };

  /**
   * 主useEffect钩子
   * 负责组件的初始化、动画启动和清理工作
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置初始画布尺寸为窗口大小
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 初始化雨滴和启动动画
    initDrops();
    draw();

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);

    // 清理函数 - 组件卸载时执行
    return () => {
      window.removeEventListener('resize', handleResize); // 移除事件监听
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current); // 取消动画
      }
      if (debounceResize.current) {
        clearTimeout(debounceResize.current); // 清除防抖计时器
      }
    };
  }, []); // 空依赖数组，仅在组件挂载时运行一次

  /**
   * 暂停状态监听useEffect
   * 当isPaused状态变化时更新ref并控制动画
   */
  useEffect(() => {
    isPausedRef.current = isPaused; // 更新ref以在draw函数中使用
    if (isPaused) {
      // 暂停时，确保animationRef被重置为null
      animationRef.current = null;
    } else {
      // 恢复播放时，直接调用draw重新启动动画
      draw();
    }
  }, [isPaused]);

  /**
   * 字符集变化监听useEffect
   * 当字符集变化时更新所有雨滴的字符
   */
  useEffect(() => {
    // 更新ref以在getRandomChar中使用最新的字符集
    currentCharsetRef.current = currentCharset;
    
    // 遍历所有雨滴，更新当前字符、尾迹和重置更新计数器
    dropsRef.current.forEach((drop: Drop) => {
      drop.currentChar = getRandomChar(); // 更新当前字符为新字符集的随机字符
      // 重新生成尾迹字符数组，全部使用新字符集
      drop.trail = Array(drop.trailLength).fill(0).map(getRandomChar);
      // 重置更新计数器，让雨滴在下一次绘制时就更新字符
      drop.updateCounter = drop.updateInterval;
    });
    
    // 即使在暂停状态下，也重新绘制一帧以立即更新显示
    if (isPaused) {
      draw();
    }
  }, [currentCharset]);

  /**
   * 切换暂停/继续状态
   */
  const togglePause = () => {
    setIsPaused((prev: boolean) => !prev); // 切换状态
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          background: '#000',
          width: '100%',
          height: '100%',
        }}
      />

      {/* 控制面板 */}
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
          onClick={togglePause}
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
          {isPaused ? '▶ 继续' : '⏸ 暂停'}
        </button>

        <select
          value={currentCharset}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentCharset(e.target.value as CharsetKey)}
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
      </div>
    </div>
  );
};

export default MatrixRain;