import { loadConfig, saveConfig, resetConfig, getDefaultConfig } from '../../services/configManager';
import { MatrixRainConfig } from '../../types';

describe('ConfigManager', () => {
    // Mock localStorage
    let localStorageMock: { [key: string]: string };

    beforeEach(() => {
        localStorageMock = {};

        global.Storage.prototype.getItem = jest.fn((key: string) => {
            return localStorageMock[key] || null;
        });

        global.Storage.prototype.setItem = jest.fn((key: string, value: string) => {
            localStorageMock[key] = value;
        });

        global.Storage.prototype.removeItem = jest.fn((key: string) => {
            delete localStorageMock[key];
        });

        // Clear console.error mock
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getDefaultConfig', () => {
        it('should return default configuration', () => {
            const config = getDefaultConfig();

            expect(config).toHaveProperty('currentCharset');
            expect(config).toHaveProperty('currentTheme');
            expect(config).toHaveProperty('fontSize');
            expect(config).toHaveProperty('density');
            expect(config).toHaveProperty('speed');
            expect(config).toHaveProperty('autoOptimize');
        });

        it('should return valid default values', () => {
            const config = getDefaultConfig();

            expect(config.currentCharset).toBe('mix');
            expect(config.currentTheme).toBe('green');
            expect(config.fontSize).toBe(24);
            expect(config.density).toBe(100);
            expect(config.speed).toBe(100);
            expect(config.autoOptimize).toBe(true);
        });

        it('should return a new object each time', () => {
            const config1 = getDefaultConfig();
            const config2 = getDefaultConfig();

            expect(config1).not.toBe(config2);
            expect(config1).toEqual(config2);
        });
    });

    describe('saveConfig', () => {
        it('should save configuration to localStorage', () => {
            const config: MatrixRainConfig = {
                currentCharset: 'en',
                currentTheme: 'blue',
                fontSize: 20,
                density: 80,
                speed: 120,
                autoOptimize: false
            };

            saveConfig(config);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'matrixRainConfig',
                JSON.stringify(config)
            );
        });

        it('should handle errors gracefully', () => {
            const config = getDefaultConfig();

            // Mock setItem to throw error
            (localStorage.setItem as jest.Mock).mockImplementation(() => {
                throw new Error('Storage full');
            });

            expect(() => {
                saveConfig(config);
            }).not.toThrow();

            expect(console.error).toHaveBeenCalled();
        });

        it('should save partial configuration', () => {
            const config: MatrixRainConfig = {
                currentCharset: 'bin',
                currentTheme: 'red',
                fontSize: 16,
                density: 50,
                speed: 90,
                autoOptimize: true
            };

            saveConfig(config);

            const saved = JSON.parse(localStorageMock['matrixRainConfig']);
            expect(saved).toEqual(config);
        });
    });

    describe('loadConfig', () => {
        it('should load configuration from localStorage', () => {
            const config: MatrixRainConfig = {
                currentCharset: 'cn',
                currentTheme: 'purple',
                fontSize: 28,
                density: 90,
                speed: 110,
                autoOptimize: true
            };

            localStorageMock['matrixRainConfig'] = JSON.stringify(config);

            const loaded = loadConfig();

            expect(loaded).toEqual(config);
        });

        it('should return null if no config exists', () => {
            const loaded = loadConfig();

            expect(loaded).toBeNull();
        });

        it('should handle invalid JSON gracefully', () => {
            localStorageMock['matrixRainConfig'] = 'invalid json {';

            const loaded = loadConfig();

            expect(loaded).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle localStorage errors', () => {
            (localStorage.getItem as jest.Mock).mockImplementation(() => {
                throw new Error('Storage error');
            });

            const loaded = loadConfig();

            expect(loaded).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });

        it('should load all config properties', () => {
            const config: MatrixRainConfig = {
                currentCharset: 'mix',
                currentTheme: 'orange',
                fontSize: 32,
                density: 75,
                speed: 85,
                autoOptimize: false
            };

            localStorageMock['matrixRainConfig'] = JSON.stringify(config);

            const loaded = loadConfig();

            expect(loaded?.currentCharset).toBe('mix');
            expect(loaded?.currentTheme).toBe('orange');
            expect(loaded?.fontSize).toBe(32);
            expect(loaded?.density).toBe(75);
            expect(loaded?.speed).toBe(85);
            expect(loaded?.autoOptimize).toBe(false);
        });
    });

    describe('resetConfig', () => {
        it('should remove configuration from localStorage', () => {
            localStorageMock['matrixRainConfig'] = JSON.stringify(getDefaultConfig());

            resetConfig();

            expect(localStorage.removeItem).toHaveBeenCalledWith('matrixRainConfig');
            expect(localStorageMock['matrixRainConfig']).toBeUndefined();
        });

        it('should not throw if config does not exist', () => {
            expect(() => {
                resetConfig();
            }).not.toThrow();
        });

        it('should allow saving new config after reset', () => {
            const config = getDefaultConfig();

            saveConfig(config);
            resetConfig();

            const loaded = loadConfig();
            expect(loaded).toBeNull();

            saveConfig(config);
            const reloaded = loadConfig();
            expect(reloaded).toEqual(config);
        });
    });

    describe('Integration', () => {
        it('should save and load config correctly', () => {
            const config: MatrixRainConfig = {
                currentCharset: 'en',
                currentTheme: 'white',
                fontSize: 18,
                density: 60,
                speed: 95,
                autoOptimize: true
            };

            saveConfig(config);
            const loaded = loadConfig();

            expect(loaded).toEqual(config);
        });

        it('should handle save, load, reset cycle', () => {
            const config = getDefaultConfig();

            saveConfig(config);
            expect(loadConfig()).toEqual(config);

            resetConfig();
            expect(loadConfig()).toBeNull();
        });

        it('should handle multiple save operations', () => {
            const config1: MatrixRainConfig = {
                currentCharset: 'en',
                currentTheme: 'green',
                fontSize: 20,
                density: 80,
                speed: 100,
                autoOptimize: true
            };

            const config2: MatrixRainConfig = {
                currentCharset: 'bin',
                currentTheme: 'blue',
                fontSize: 24,
                density: 90,
                speed: 120,
                autoOptimize: false
            };

            saveConfig(config1);
            expect(loadConfig()).toEqual(config1);

            saveConfig(config2);
            expect(loadConfig()).toEqual(config2);
        });
    });
});
