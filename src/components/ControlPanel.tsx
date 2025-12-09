import React from 'react';
import { MatrixRainConfig } from '../types';

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
        onChange={(e) => onConfigChange({ currentCharset: e.target.value as any })}
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
        onChange={(e) => onConfigChange({ currentTheme: e.target.value as any })}
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