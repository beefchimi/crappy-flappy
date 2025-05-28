import { Graphics } from 'pixi.js';

export interface Bird {
  sprite: Graphics;
  velocity: number;
  flapFrame: number;
  angle: number;
}

export function createBird(x: number, y: number): Bird {
  const sprite = new Graphics();
  // Body
  sprite.beginFill(0xffff00);
  sprite.drawCircle(0, 0, 24);
  sprite.endFill();
  // Belly (white arc)
  sprite.beginFill(0xffffff);
  sprite.moveTo(0, 0);
  sprite.arc(0, 6, 18, Math.PI * 0.15, Math.PI * 0.85);
  sprite.lineTo(0, 0);
  sprite.endFill();
  // Beak (orange triangle)
  sprite.beginFill(0xffa500);
  sprite.drawPolygon([18, -2, 32, 2, 18, 6]);
  sprite.endFill();
  // Eye (black)
  sprite.beginFill(0x000000);
  sprite.drawCircle(10, -8, 3.5);
  sprite.endFill();
  // Wing (white oval)
  sprite.beginFill(0xffffff);
  sprite.drawEllipse(-8, 2, 8, 12);
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