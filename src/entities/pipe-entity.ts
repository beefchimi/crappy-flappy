import { Graphics, Container } from 'pixi.js';

export interface Pipe {
  container: Container;
  top: Graphics;
  bottom: Graphics;
  x: number;
  width: number;
  gapY: number;
  gapHeight: number;
  passed: boolean;
}

export function createPipe(
  x: number,
  screenHeight: number,
  gapY: number,
  gapHeight: number,
  width = 64,
  color = 0x4ec04e
): Pipe {
  const container = new Container();
  const top = new Graphics();
  const bottom = new Graphics();

  // Top pipe
  top.beginFill(color);
  top.drawRect(0, 0, width, gapY);
  top.endFill();
  top.x = 0;
  top.y = 0;

  // Bottom pipe
  bottom.beginFill(color);
  bottom.drawRect(0, 0, width, screenHeight - (gapY + gapHeight));
  bottom.endFill();
  bottom.x = 0;
  bottom.y = gapY + gapHeight;

  container.addChild(top);
  container.addChild(bottom);
  container.x = x;
  container.y = 0;

  return {
    container,
    top,
    bottom,
    x,
    width,
    gapY,
    gapHeight,
    passed: false,
  };
}

export function getRandomGapY(screenHeight: number, gapHeight: number, margin = 48): number {
  const min = margin;
  const max = screenHeight - gapHeight - margin;
  return Math.floor(Math.random() * (max - min + 1)) + min;
} 