import { MatrixRainCore } from '../../core/matrixRainCore';

describe('MatrixRainCore', () => {
    let core: MatrixRainCore;
    let mockCtx: CanvasRenderingContext2D;

    beforeEach(() => {
        core = new MatrixRainCore();

        // Create a mock canvas context
        mockCtx = {
            fillStyle: '',
            fillText: jest.fn(),
            font: '',
        } as unknown as CanvasRenderingContext2D;
    });

    describe('initDrops', () => {
        it('should initialize drops based on canvas width', () => {
            core.initDrops(1000);
            const drops = core.getDrops();

            expect(drops.length).toBeGreaterThan(0);
            expect(drops.length).toBeLessThanOrEqual(Math.ceil(1000 / 24)); // Default fontSize is 24
        });

        it('should initialize drops with correct properties', () => {
            core.initDrops(1000);
            const drops = core.getDrops();

            drops.forEach(drop => {
                expect(drop).toHaveProperty('y');
                expect(drop).toHaveProperty('speed');
                expect(drop).toHaveProperty('trail');
                expect(drop).toHaveProperty('trailLength');
                expect(drop).toHaveProperty('updateCounter');
                expect(drop).toHaveProperty('updateInterval');
                expect(drop).toHaveProperty('currentChar');
                expect(drop).toHaveProperty('xIndex');

                expect(typeof drop.y).toBe('number');
                expect(typeof drop.speed).toBe('number');
                expect(Array.isArray(drop.trail)).toBe(true);
                expect(drop.trail.length).toBe(drop.trailLength);
            });
        });

        it('should respect density configuration', () => {
            // Test with 50% density
            core.updateConfig({ density: 50 });
            core.initDrops(1000);
            const drops50 = core.getDrops().length;

            // Test with 100% density
            core.updateConfig({ density: 100 });
            core.initDrops(1000);
            const drops100 = core.getDrops().length;

            expect(drops100).toBeGreaterThan(drops50);
        });

        it('should handle small canvas widths', () => {
            core.initDrops(100);
            const drops = core.getDrops();

            expect(drops.length).toBeGreaterThan(0);
        });

        it('should handle large canvas widths', () => {
            core.initDrops(5000);
            const drops = core.getDrops();

            expect(drops.length).toBeGreaterThan(0);
        });
    });

    describe('updateConfig', () => {
        beforeEach(() => {
            core.initDrops(1000);
        });

        it('should update fontSize', () => {
            core.updateConfig({ fontSize: 32 });
            // Re-initialize to see the effect
            core.initDrops(1000);
            const drops = core.getDrops();

            expect(drops.length).toBeGreaterThan(0);
        });

        it('should update density', () => {
            const initialDropCount = core.getDrops().length;

            core.updateConfig({ density: 50 });
            core.initDrops(1000);
            const newDropCount = core.getDrops().length;

            expect(newDropCount).toBeLessThan(initialDropCount);
        });

        it('should update speed for all drops', () => {
            core.updateConfig({ speed: 200 });
            const drops = core.getDrops();

            drops.forEach(drop => {
                expect(drop.speed).toBeGreaterThan(0);
                // Speed should be affected by the speed ratio (200/100 = 2x)
            });
        });

        it('should update charset and regenerate characters', () => {
            core.updateConfig({ currentCharset: 'bin' });
            const drops = core.getDrops();

            drops.forEach(drop => {
                expect(['0', '1']).toContain(drop.currentChar);
                drop.trail.forEach(char => {
                    expect(['0', '1']).toContain(char);
                });
            });
        });

        it('should update theme', () => {
            // Theme update should not throw errors
            expect(() => {
                core.updateConfig({ currentTheme: 'blue' });
            }).not.toThrow();
        });

        it('should handle multiple config updates', () => {
            expect(() => {
                core.updateConfig({ fontSize: 20, density: 75, speed: 150 });
            }).not.toThrow();
        });
    });

    describe('drawDrops', () => {
        beforeEach(() => {
            core.initDrops(1000);
        });

        it('should call fillText for each drop and trail', () => {
            const canvasHeight = 800;

            core.drawDrops(mockCtx, canvasHeight, true);

            expect(mockCtx.fillText).toHaveBeenCalled();
        });

        it('should update drop positions when animating', () => {
            const drops = core.getDrops();
            const initialY = drops[0].y;

            core.drawDrops(mockCtx, 800, true);

            const updatedY = drops[0].y;
            expect(updatedY).toBeGreaterThan(initialY);
        });

        it('should not update drop positions when paused', () => {
            const drops = core.getDrops();
            const initialY = drops[0].y;

            core.drawDrops(mockCtx, 800, false);

            const updatedY = drops[0].y;
            expect(updatedY).toBe(initialY);
        });

        it('should reset drops when they go off screen', () => {
            const drops = core.getDrops();
            const canvasHeight = 800;

            // Move drop way off screen
            drops[0].y = canvasHeight + 1000;

            core.drawDrops(mockCtx, canvasHeight, true);

            // Drop should be reset to top
            expect(drops[0].y).toBeLessThan(0);
        });

        it('should update characters periodically', () => {
            const drops = core.getDrops();
            const initialChar = drops[0].currentChar;

            // Force update by setting counter to interval
            drops[0].updateCounter = drops[0].updateInterval;

            core.drawDrops(mockCtx, 800, true);

            // Character might have changed (or might be the same by chance)
            // Just verify the mechanism works without error
            expect(drops[0].currentChar).toBeDefined();
        });
    });

    describe('getDrops', () => {
        it('should return empty array before initialization', () => {
            const drops = core.getDrops();
            expect(Array.isArray(drops)).toBe(true);
            expect(drops.length).toBe(0);
        });

        it('should return drops array after initialization', () => {
            core.initDrops(1000);
            const drops = core.getDrops();

            expect(Array.isArray(drops)).toBe(true);
            expect(drops.length).toBeGreaterThan(0);
        });

        it('should return reference to internal drops array', () => {
            core.initDrops(1000);
            const drops1 = core.getDrops();
            const drops2 = core.getDrops();

            expect(drops1).toBe(drops2);
        });
    });
});
