import { EffectRenderer } from '../../core/effectRenderer';
import { InteractionEffect } from '../../types';

describe('EffectRenderer', () => {
    let renderer: EffectRenderer;
    let mockCtx: CanvasRenderingContext2D;

    beforeEach(() => {
        renderer = new EffectRenderer();

        // Create a comprehensive mock canvas context
        mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            font: '',
            textAlign: 'left',
            textBaseline: 'top',
            fillText: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            stroke: jest.fn(),
        } as unknown as CanvasRenderingContext2D;
    });

    describe('addEffect', () => {
        it('should add a ripple effect', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'ripple',
                life: 1,
                maxLife: 1,
                radius: 5
            };

            expect(() => {
                renderer.addEffect(effect);
            }).not.toThrow();
        });

        it('should add an explosion effect', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'explosion',
                life: 1,
                maxLife: 1,
                radius: 10,
                particles: []
            };

            expect(() => {
                renderer.addEffect(effect);
            }).not.toThrow();
        });

        it('should add a text effect', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'text',
                life: 1,
                maxLife: 1,
                radius: 0,
                text: 'MATRIX'
            };

            expect(() => {
                renderer.addEffect(effect);
            }).not.toThrow();
        });

        it('should add a follow effect', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'follow',
                life: 1,
                maxLife: 1,
                radius: 0,
                followerCount: 10
            };

            expect(() => {
                renderer.addEffect(effect);
            }).not.toThrow();
        });

        it('should add multiple effects', () => {
            const effect1: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'ripple',
                life: 1,
                maxLife: 1,
                radius: 5
            };

            const effect2: InteractionEffect = {
                x: 200,
                y: 200,
                type: 'explosion',
                life: 1,
                maxLife: 1,
                radius: 10,
                particles: []
            };

            renderer.addEffect(effect1);
            renderer.addEffect(effect2);

            // Should render both without errors
            expect(() => {
                renderer.renderEffects(mockCtx, 24, 'en', true);
            }).not.toThrow();
        });
    });

    describe('renderEffects', () => {
        it('should render ripple effects', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'ripple',
                life: 1,
                maxLife: 1,
                radius: 5
            };

            renderer.addEffect(effect);
            renderer.renderEffects(mockCtx, 24, 'en', true);

            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.stroke).toHaveBeenCalled();
        });

        it('should render explosion effects with particles', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'explosion',
                life: 1,
                maxLife: 1,
                radius: 10,
                particles: [
                    {
                        x: 100,
                        y: 100,
                        vx: 1,
                        vy: 1,
                        life: 1,
                        maxLife: 1,
                        char: 'A'
                    }
                ]
            };

            renderer.addEffect(effect);
            renderer.renderEffects(mockCtx, 24, 'en', true);

            expect(mockCtx.fillText).toHaveBeenCalled();
        });

        it('should render text effects', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'text',
                life: 1,
                maxLife: 1,
                radius: 0,
                text: 'MATRIX'
            };

            renderer.addEffect(effect);
            renderer.renderEffects(mockCtx, 24, 'en', true);

            expect(mockCtx.fillText).toHaveBeenCalledWith('MATRIX', 100, 100);
        });

        it('should render follow effects', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'follow',
                life: 1,
                maxLife: 1,
                radius: 0,
                followerCount: 5
            };

            renderer.addEffect(effect);
            renderer.renderEffects(mockCtx, 24, 'en', true);

            // Should render multiple follower characters
            expect(mockCtx.fillText).toHaveBeenCalled();
        });

        it('should update effects when animating', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'ripple',
                life: 1,
                maxLife: 1,
                radius: 5
            };

            renderer.addEffect(effect);

            // Render with animation
            renderer.renderEffects(mockCtx, 24, 'en', true);

            // Life should decrease and radius should increase
            // (We can't directly test this without accessing private effects array)
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should not update effects when paused', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'ripple',
                life: 1,
                maxLife: 1,
                radius: 5
            };

            renderer.addEffect(effect);

            // Render without animation (paused)
            renderer.renderEffects(mockCtx, 24, 'en', false);

            // Should still render but not update
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should remove expired effects', () => {
            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'ripple',
                life: 0.01, // Very low life
                maxLife: 1,
                radius: 5
            };

            renderer.addEffect(effect);

            // Render multiple times to expire the effect
            for (let i = 0; i < 10; i++) {
                renderer.renderEffects(mockCtx, 24, 'en', true);
            }

            // Effect should be removed (no errors should occur)
            expect(() => {
                renderer.renderEffects(mockCtx, 24, 'en', true);
            }).not.toThrow();
        });

        it('should handle empty effects array', () => {
            expect(() => {
                renderer.renderEffects(mockCtx, 24, 'en', true);
            }).not.toThrow();
        });
    });

    describe('updateTheme', () => {
        it('should update theme without errors', () => {
            expect(() => {
                renderer.updateTheme('blue');
            }).not.toThrow();
        });

        it('should apply new theme to effects', () => {
            renderer.updateTheme('blue');

            const effect: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'ripple',
                life: 1,
                maxLife: 1,
                radius: 5
            };

            renderer.addEffect(effect);

            expect(() => {
                renderer.renderEffects(mockCtx, 24, 'en', true);
            }).not.toThrow();
        });

        it('should work with all theme types', () => {
            const themes: Array<'green' | 'blue' | 'purple' | 'red' | 'orange' | 'white'> =
                ['green', 'blue', 'purple', 'red', 'orange', 'white'];

            themes.forEach(theme => {
                expect(() => {
                    renderer.updateTheme(theme);
                }).not.toThrow();
            });
        });
    });

    describe('clearEffects', () => {
        it('should clear all effects', () => {
            const effect1: InteractionEffect = {
                x: 100,
                y: 100,
                type: 'ripple',
                life: 1,
                maxLife: 1,
                radius: 5
            };

            const effect2: InteractionEffect = {
                x: 200,
                y: 200,
                type: 'explosion',
                life: 1,
                maxLife: 1,
                radius: 10,
                particles: []
            };

            renderer.addEffect(effect1);
            renderer.addEffect(effect2);

            renderer.clearEffects();

            // After clearing, rendering should not call any drawing methods
            const fillTextCallsBefore = (mockCtx.fillText as jest.Mock).mock.calls.length;
            renderer.renderEffects(mockCtx, 24, 'en', true);
            const fillTextCallsAfter = (mockCtx.fillText as jest.Mock).mock.calls.length;

            expect(fillTextCallsAfter).toBe(fillTextCallsBefore);
        });

        it('should handle clearing empty effects', () => {
            expect(() => {
                renderer.clearEffects();
            }).not.toThrow();
        });
    });
});
