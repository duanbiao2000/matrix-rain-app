import { render, screen, fireEvent } from '@testing-library/react';
import ControlPanel from '../../components/ControlPanel';
import { getDefaultConfig } from '../../services/configManager';

describe('ControlPanel', () => {
    const mockOnConfigChange = jest.fn();
    const mockOnTogglePause = jest.fn();
    const mockOnResetConfig = jest.fn();

    const defaultProps = {
        config: getDefaultConfig(),
        isPaused: false,
        fps: 60,
        onConfigChange: mockOnConfigChange,
        onTogglePause: mockOnTogglePause,
        onResetConfig: mockOnResetConfig,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render all controls', () => {
            render(<ControlPanel {...defaultProps} />);

            expect(screen.getByText(/暂停/)).toBeInTheDocument();
            expect(screen.getByText(/字体大小/)).toBeInTheDocument();
            expect(screen.getByText(/雨滴密度/)).toBeInTheDocument();
            expect(screen.getByText(/下落速度/)).toBeInTheDocument();
            expect(screen.getByText(/自动性能优化/)).toBeInTheDocument();
            expect(screen.getByText(/重置配置/)).toBeInTheDocument();
        });

        it('should display current FPS', () => {
            render(<ControlPanel {...defaultProps} fps={45} />);

            expect(screen.getByText(/FPS: 45/)).toBeInTheDocument();
        });

        it('should show pause button when not paused', () => {
            render(<ControlPanel {...defaultProps} isPaused={false} />);

            expect(screen.getByText(/⏸ 暂停/)).toBeInTheDocument();
        });

        it('should show resume button when paused', () => {
            render(<ControlPanel {...defaultProps} isPaused={true} />);

            expect(screen.getByText(/▶ 继续/)).toBeInTheDocument();
        });

        it('should display current configuration values', () => {
            const config = {
                ...getDefaultConfig(),
                fontSize: 28,
                density: 85,
                speed: 120,
            };

            render(<ControlPanel {...defaultProps} config={config} />);

            expect(screen.getByText(/字体大小: 28px/)).toBeInTheDocument();
            expect(screen.getByText(/雨滴密度: 85%/)).toBeInTheDocument();
            expect(screen.getByText(/下落速度: 120%/)).toBeInTheDocument();
        });
    });

    describe('Pause/Resume Button', () => {
        it('should call onTogglePause when pause button clicked', () => {
            render(<ControlPanel {...defaultProps} />);

            const pauseButton = screen.getByText(/暂停/);
            fireEvent.click(pauseButton);

            expect(mockOnTogglePause).toHaveBeenCalledTimes(1);
        });

        it('should call onTogglePause when resume button clicked', () => {
            render(<ControlPanel {...defaultProps} isPaused={true} />);

            const resumeButton = screen.getByText(/继续/);
            fireEvent.click(resumeButton);

            expect(mockOnTogglePause).toHaveBeenCalledTimes(1);
        });
    });

    describe('Charset Selection', () => {
        it('should display current charset', () => {
            render(<ControlPanel {...defaultProps} />);

            const select = screen.getByDisplayValue('混合字符');
            expect(select).toBeInTheDocument();
        });

        it('should call onConfigChange when charset changes', () => {
            render(<ControlPanel {...defaultProps} />);

            const select = screen.getByDisplayValue('混合字符');
            fireEvent.change(select, { target: { value: 'en' } });

            expect(mockOnConfigChange).toHaveBeenCalledWith({ currentCharset: 'en' });
        });

        it('should have all charset options', () => {
            render(<ControlPanel {...defaultProps} />);

            expect(screen.getByText('英文+符号')).toBeInTheDocument();
            expect(screen.getByText('中文+日文')).toBeInTheDocument();
            expect(screen.getByText('二进制 (0/1)')).toBeInTheDocument();
            expect(screen.getByText('混合字符')).toBeInTheDocument();
        });
    });

    describe('Theme Selection', () => {
        it('should display current theme', () => {
            render(<ControlPanel {...defaultProps} />);

            const select = screen.getByDisplayValue('经典绿色');
            expect(select).toBeInTheDocument();
        });

        it('should call onConfigChange when theme changes', () => {
            render(<ControlPanel {...defaultProps} />);

            const select = screen.getByDisplayValue('经典绿色');
            fireEvent.change(select, { target: { value: 'blue' } });

            expect(mockOnConfigChange).toHaveBeenCalledWith({ currentTheme: 'blue' });
        });

        it('should have all theme options', () => {
            render(<ControlPanel {...defaultProps} />);

            expect(screen.getByText('经典绿色')).toBeInTheDocument();
            expect(screen.getByText('科技蓝')).toBeInTheDocument();
            expect(screen.getByText('神秘紫')).toBeInTheDocument();
            expect(screen.getByText('警示红')).toBeInTheDocument();
            expect(screen.getByText('温暖橙')).toBeInTheDocument();
            expect(screen.getByText('简洁白')).toBeInTheDocument();
        });
    });

    describe('Font Size Slider', () => {
        it('should display current font size', () => {
            const config = { ...getDefaultConfig(), fontSize: 32 };
            render(<ControlPanel {...defaultProps} config={config} />);

            const slider = screen.getByDisplayValue('32');
            expect(slider).toBeInTheDocument();
        });

        it('should call onConfigChange when font size changes', () => {
            render(<ControlPanel {...defaultProps} />);

            const slider = screen.getByDisplayValue('24');
            fireEvent.change(slider, { target: { value: '30' } });

            expect(mockOnConfigChange).toHaveBeenCalledWith({ fontSize: 30 });
        });

        it('should have correct min and max values', () => {
            render(<ControlPanel {...defaultProps} />);

            const slider = screen.getByDisplayValue('24') as HTMLInputElement;
            expect(slider.min).toBe('8');
            expect(slider.max).toBe('48');
        });
    });

    describe('Density Slider', () => {
        it('should display current density', () => {
            const config = { ...getDefaultConfig(), density: 75 };
            render(<ControlPanel {...defaultProps} config={config} />);

            const slider = screen.getByDisplayValue('75');
            expect(slider).toBeInTheDocument();
        });

        it('should call onConfigChange when density changes', () => {
            render(<ControlPanel {...defaultProps} />);

            const slider = screen.getByDisplayValue('100');
            fireEvent.change(slider, { target: { value: '80' } });

            expect(mockOnConfigChange).toHaveBeenCalledWith({ density: 80 });
        });

        it('should have correct min and max values', () => {
            render(<ControlPanel {...defaultProps} />);

            const slider = screen.getByDisplayValue('100') as HTMLInputElement;
            expect(slider.min).toBe('10');
            expect(slider.max).toBe('100');
        });
    });

    describe('Speed Slider', () => {
        it('should display current speed', () => {
            const config = { ...getDefaultConfig(), speed: 150 };
            render(<ControlPanel {...defaultProps} config={config} />);

            const slider = screen.getByDisplayValue('150');
            expect(slider).toBeInTheDocument();
        });

        it('should call onConfigChange when speed changes', () => {
            render(<ControlPanel {...defaultProps} />);

            const slider = screen.getByDisplayValue('100');
            fireEvent.change(slider, { target: { value: '120' } });

            expect(mockOnConfigChange).toHaveBeenCalledWith({ speed: 120 });
        });

        it('should have correct min and max values', () => {
            render(<ControlPanel {...defaultProps} />);

            const slider = screen.getByDisplayValue('100') as HTMLInputElement;
            expect(slider.min).toBe('10');
            expect(slider.max).toBe('200');
        });
    });

    describe('Auto Optimize Checkbox', () => {
        it('should display checked when autoOptimize is true', () => {
            const config = { ...getDefaultConfig(), autoOptimize: true };
            render(<ControlPanel {...defaultProps} config={config} />);

            const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
            expect(checkbox.checked).toBe(true);
        });

        it('should display unchecked when autoOptimize is false', () => {
            const config = { ...getDefaultConfig(), autoOptimize: false };
            render(<ControlPanel {...defaultProps} config={config} />);

            const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
            expect(checkbox.checked).toBe(false);
        });

        it('should call onConfigChange when checkbox is toggled', () => {
            render(<ControlPanel {...defaultProps} />);

            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);

            expect(mockOnConfigChange).toHaveBeenCalledWith({ autoOptimize: false });
        });
    });

    describe('Reset Button', () => {
        it('should call onResetConfig when clicked', () => {
            render(<ControlPanel {...defaultProps} />);

            const resetButton = screen.getByText('重置配置');
            fireEvent.click(resetButton);

            expect(mockOnResetConfig).toHaveBeenCalledTimes(1);
        });
    });

    describe('Integration', () => {
        it('should handle multiple config changes', () => {
            render(<ControlPanel {...defaultProps} />);

            const themeSelect = screen.getByDisplayValue('经典绿色');
            fireEvent.change(themeSelect, { target: { value: 'blue' } });

            const fontSlider = screen.getByDisplayValue('24');
            fireEvent.change(fontSlider, { target: { value: '30' } });

            expect(mockOnConfigChange).toHaveBeenCalledTimes(2);
            expect(mockOnConfigChange).toHaveBeenNthCalledWith(1, { currentTheme: 'blue' });
            expect(mockOnConfigChange).toHaveBeenNthCalledWith(2, { fontSize: 30 });
        });

        it('should not call callbacks when just rendering', () => {
            render(<ControlPanel {...defaultProps} />);

            expect(mockOnConfigChange).not.toHaveBeenCalled();
            expect(mockOnTogglePause).not.toHaveBeenCalled();
            expect(mockOnResetConfig).not.toHaveBeenCalled();
        });
    });
});
