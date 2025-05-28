import { Graphics } from 'pixi.js';

export interface Bird {
  sprite: Graphics;
  velocity: number;
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
  };
} 