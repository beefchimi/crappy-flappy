import { Graphics } from 'pixi.js';

export interface Bird {
  sprite: Graphics;
  velocity: number;
  flapFrame: number;
  angle: number;
}

export function createBird(x: number, y: number): Bird {
  const sprite = new Graphics();
  sprite.beginFill(0xffff00);
  sprite.drawCircle(0, 0, 24);
  sprite.endFill();
  sprite.x = x;
  sprite.y = y;

  return {
    sprite,
    velocity: 0,
    flapFrame: 0,
    angle: 0,
  };
}

export function updateBird(bird: Bird, isFlapping: boolean) {
  // Flap animation: scale up briefly when flapping
  if (isFlapping) {
    bird.flapFrame = 8;
  }
  if (bird.flapFrame > 0) {
    bird.sprite.scale.y = 1.15;
    bird.sprite.scale.x = 0.9;
    bird.flapFrame--;
  } else {
    bird.sprite.scale.y += (1 - bird.sprite.scale.y) * 0.2;
    bird.sprite.scale.x += (1 - bird.sprite.scale.x) * 0.2;
  }
  // Bird angle: tilt up when moving up, down when falling
  bird.angle = Math.max(-0.6, Math.min(1.2, bird.velocity * 0.04));
  bird.sprite.rotation = bird.angle;
} 