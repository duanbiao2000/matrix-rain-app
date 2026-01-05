import { InteractionHandler } from '../../core/interactionHandler';
import { InteractionEffect } from '../../types';

describe('InteractionHandler', () => {
    let handler: InteractionHandler;
    let addedEffects: InteractionEffect[];

    beforeEach(() => {
        addedEffects = [];
        const onEffectAdd = (effect: InteractionEffect) => {
            addedEffects.push(effect);
        };
        handler = new InteractionHandler(onEffectAdd);
    });

    describe('handleClick', () => {
        it('should create an explosion effect', () => {
            handler.handleClick(100, 200, 'en');

            expect(addedEffects.length).toBe(1);
            expect(addedEffects[0].type).toBe('explosion');
            expect(addedEffects[0].x).toBe(100);
            expect(addedEffects[0].y).toBe(200);
        });

        it('should create particles for explosion', () => {
            handler.handleClick(100, 200, 'en');

            const effect = addedEffects[0];
            expect(effect.particles).toBeDefined();
            expect(effect.particles!.length).toBeGreaterThan(0);
        });

        it('should create particles with correct properties', () => {
            handler.handleClick(100, 200, 'en');

            const effect = addedEffects[0];
            effect.particles!.forEach(particle => {
                expect(particle).toHaveProperty('x');
                expect(particle).toHaveProperty('y');
                expect(particle).toHaveProperty('vx');
                expect(particle).toHaveProperty('vy');
                expect(particle).toHaveProperty('life');
                expect(particle).toHaveProperty('maxLife');
                expect(particle).toHaveProperty('char');

                expect(typeof particle.char).toBe('string');
                expect(particle.char.length).toBe(1);
            });
        });

        it('should use characters from specified charset', () => {
            handler.handleClick(100, 200, 'bin');

            const effect = addedEffects[0];
            effect.particles!.forEach(particle => {
                expect(['0', '1']).toContain(particle.char);
            });
        });

        it('should create particles radiating outward', () => {
            handler.handleClick(100, 200, 'en');

            const effect = addedEffects[0];
            const particles = effect.particles!;

            // Check that particles have different velocities (radiating pattern)
            const velocities = particles.map(p => ({ vx: p.vx, vy: p.vy }));
            const uniqueVelocities = new Set(velocities.map(v => `${v.vx},${v.vy}`));

            expect(uniqueVelocities.size).toBeGreaterThan(1);
        });

        it('should handle multiple clicks', () => {
            handler.handleClick(100, 200, 'en');
            handler.handleClick(300, 400, 'en');

            expect(addedEffects.length).toBe(2);
            expect(addedEffects[0].x).toBe(100);
            expect(addedEffects[1].x).toBe(300);
        });
    });

    describe('handleMove', () => {
        it('should create a ripple effect', () => {
            handler.handleMove(150, 250);

            expect(addedEffects.length).toBe(1);
            expect(addedEffects[0].type).toBe('ripple');
            expect(addedEffects[0].x).toBe(150);
            expect(addedEffects[0].y).toBe(250);
        });

        it('should update mouse position', () => {
            handler.handleMove(150, 250);

            const position = handler.getMousePosition();
            expect(position.x).toBe(150);
            expect(position.y).toBe(250);
        });

        it('should create ripple on each move', () => {
            handler.handleMove(100, 100);
            handler.handleMove(200, 200);
            handler.handleMove(300, 300);

            expect(addedEffects.length).toBe(3);
            expect(addedEffects.every(e => e.type === 'ripple')).toBe(true);
        });

        it('should create ripples at different positions', () => {
            handler.handleMove(100, 100);
            handler.handleMove(200, 200);

            expect(addedEffects[0].x).toBe(100);
            expect(addedEffects[0].y).toBe(100);
            expect(addedEffects[1].x).toBe(200);
            expect(addedEffects[1].y).toBe(200);
        });
    });

    describe('createTextEffect', () => {
        it('should create a text effect', () => {
            handler.createTextEffect(100, 200, 'MATRIX');

            expect(addedEffects.length).toBe(1);
            expect(addedEffects[0].type).toBe('text');
            expect(addedEffects[0].x).toBe(100);
            expect(addedEffects[0].y).toBe(200);
            expect(addedEffects[0].text).toBe('MATRIX');
        });

        it('should handle different text strings', () => {
            handler.createTextEffect(100, 200, 'Hello World');

            expect(addedEffects[0].text).toBe('Hello World');
        });

        it('should handle empty text', () => {
            handler.createTextEffect(100, 200, '');

            expect(addedEffects[0].text).toBe('');
        });

        it('should create multiple text effects', () => {
            handler.createTextEffect(100, 200, 'TEXT1');
            handler.createTextEffect(300, 400, 'TEXT2');

            expect(addedEffects.length).toBe(2);
            expect(addedEffects[0].text).toBe('TEXT1');
            expect(addedEffects[1].text).toBe('TEXT2');
        });
    });

    describe('createFollowEffect', () => {
        it('should create a follow effect', () => {
            handler.createFollowEffect();

            expect(addedEffects.length).toBe(1);
            expect(addedEffects[0].type).toBe('follow');
        });

        it('should use current mouse position', () => {
            handler.handleMove(150, 250);
            addedEffects = []; // Clear ripple effect

            handler.createFollowEffect();

            expect(addedEffects[0].x).toBe(150);
            expect(addedEffects[0].y).toBe(250);
        });

        it('should have follower count', () => {
            handler.createFollowEffect();

            expect(addedEffects[0].followerCount).toBeDefined();
            expect(addedEffects[0].followerCount).toBeGreaterThan(0);
        });

        it('should create multiple follow effects', () => {
            handler.createFollowEffect();
            handler.createFollowEffect();

            const followEffects = addedEffects.filter(e => e.type === 'follow');
            expect(followEffects.length).toBe(2);
        });

        it('should work with default mouse position', () => {
            // Create follow effect without moving mouse first
            handler.createFollowEffect();

            expect(addedEffects.length).toBe(1);
            expect(addedEffects[0].type).toBe('follow');
            expect(addedEffects[0].x).toBe(0);
            expect(addedEffects[0].y).toBe(0);
        });
    });

    describe('getMousePosition', () => {
        it('should return initial position (0, 0)', () => {
            const position = handler.getMousePosition();

            expect(position.x).toBe(0);
            expect(position.y).toBe(0);
        });

        it('should return updated position after move', () => {
            handler.handleMove(123, 456);
            const position = handler.getMousePosition();

            expect(position.x).toBe(123);
            expect(position.y).toBe(456);
        });

        it('should return latest position after multiple moves', () => {
            handler.handleMove(100, 100);
            handler.handleMove(200, 200);
            handler.handleMove(300, 300);

            const position = handler.getMousePosition();
            expect(position.x).toBe(300);
            expect(position.y).toBe(300);
        });
    });

    describe('Integration', () => {
        it('should handle mixed interactions', () => {
            handler.handleMove(100, 100);
            handler.handleClick(150, 150, 'en');
            handler.createTextEffect(200, 200, 'TEST');
            handler.createFollowEffect();

            expect(addedEffects.length).toBe(4);
            expect(addedEffects[0].type).toBe('ripple');
            expect(addedEffects[1].type).toBe('explosion');
            expect(addedEffects[2].type).toBe('text');
            expect(addedEffects[3].type).toBe('follow');
        });

        it('should maintain mouse position across different interactions', () => {
            handler.handleMove(100, 100);
            handler.handleClick(200, 200, 'en');

            const position = handler.getMousePosition();
            expect(position.x).toBe(100);
            expect(position.y).toBe(100);
        });
    });
});
