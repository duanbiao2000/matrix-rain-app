import { getRandomChar, getColorByIntensity, isMobileDevice } from '../../utils';
import { CHARSETS } from '../../config';

describe('Utils', () => {
    describe('getRandomChar', () => {
        it('should return a character from the specified charset', () => {
            const char = getRandomChar('en');
            const charset = CHARSETS.en;
            expect(charset).toContain(char);
        });

        it('should return different characters on multiple calls', () => {
            const chars = new Set<string>();
            for (let i = 0; i < 100; i++) {
                chars.add(getRandomChar('en'));
            }
            // Should have at least 2 different characters in 100 calls
            expect(chars.size).toBeGreaterThan(1);
        });

        it('should work with all charset types', () => {
            const charsetKeys: Array<keyof typeof CHARSETS> = ['en', 'cn', 'bin', 'mix'];

            charsetKeys.forEach(key => {
                const char = getRandomChar(key);
                const charset = CHARSETS[key];
                expect(charset).toContain(char);
            });
        });

        it('should return binary characters for bin charset', () => {
            const char = getRandomChar('bin');
            expect(['0', '1']).toContain(char);
        });
    });

    describe('getColorByIntensity', () => {
        it('should return primary color for high intensity (> 0.8)', () => {
            const color = getColorByIntensity(0.9, 'green');
            expect(color).toBe('#00ff00');
        });

        it('should return primary color for intensity = 1', () => {
            const color = getColorByIntensity(1, 'green');
            expect(color).toBe('#00ff00');
        });

        it('should return color with alpha for medium intensity (0.5-0.8)', () => {
            const color = getColorByIntensity(0.6, 'green');
            // Should be secondary color with alpha
            expect(color).toMatch(/^#00cc00[0-9a-f]{2}$/i);
        });

        it('should return color with alpha for low intensity (0.2-0.5)', () => {
            const color = getColorByIntensity(0.3, 'green');
            // Should be secondary color with alpha
            expect(color).toMatch(/^#00cc00[0-9a-f]{2}$/i);
        });

        it('should return tertiary color with alpha for very low intensity (< 0.2)', () => {
            const color = getColorByIntensity(0.1, 'green');
            // Should be tertiary color with alpha
            expect(color).toMatch(/^#008800[0-9a-f]{2}$/i);
        });

        it('should work with different themes', () => {
            const themes: Array<'green' | 'blue' | 'purple' | 'red' | 'orange' | 'white'> =
                ['green', 'blue', 'purple', 'red', 'orange', 'white'];

            themes.forEach(theme => {
                const color = getColorByIntensity(1, theme);
                expect(color).toMatch(/^#[0-9a-f]{6}$/i);
            });
        });

        it('should handle edge case intensity = 0', () => {
            const color = getColorByIntensity(0, 'green');
            expect(color).toMatch(/^#[0-9a-f]{6}[0-9a-f]{2}$/i);
        });
    });

    describe('isMobileDevice', () => {
        const originalUserAgent = navigator.userAgent;

        afterEach(() => {
            // Restore original userAgent
            Object.defineProperty(navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true
            });
        });

        it('should return true for Android devices', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
                configurable: true
            });
            expect(isMobileDevice()).toBe(true);
        });

        it('should return true for iPhone devices', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
                configurable: true
            });
            expect(isMobileDevice()).toBe(true);
        });

        it('should return true for iPad devices', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
                configurable: true
            });
            expect(isMobileDevice()).toBe(true);
        });

        it('should return false for desktop browsers', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                configurable: true
            });
            expect(isMobileDevice()).toBe(false);
        });

        it('should return false for Mac desktop', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                configurable: true
            });
            expect(isMobileDevice()).toBe(false);
        });
    });
});
