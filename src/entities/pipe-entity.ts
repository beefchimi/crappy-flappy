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

const PIPE_COLOR = 0x79c850;
const PIPE_RIM = 0x578a34;
const PIPE_HIGHLIGHT = 0xb6e57a;
const PIPE_RIM_HEIGHT = 16;

export function createPipe(
  x: number,
  screenHeight: number,
  gapY: number,
  gapHeight: number,
  width = 64,
  color = PIPE_COLOR
): Pipe {
  const container = new Container();

  // Top pipe
  const top = new Graphics();
  top.beginFill(color);
  top.drawRect(0, PIPE_RIM_HEIGHT, width, gapY - PIPE_RIM_HEIGHT);
  top.endFill();
  // Rim
  top.beginFill(PIPE_RIM);
  top.drawRect(0, 0, width, PIPE_RIM_HEIGHT);
  top.endFill();
  // Highlight
  top.beginFill(PIPE_HIGHLIGHT);
  top.drawRect(6, PIPE_RIM_HEIGHT + 8, 10, gapY - PIPE_RIM_HEIGHT - 16);
  top.endFill();
  top.x = 0;
  top.y = 0;

  // Bottom pipe
  const bottom = new Graphics();
  bottom.beginFill(color);
  bottom.drawRect(0, 0, width, screenHeight - (gapY + gapHeight));
  bottom.endFill();
  // Rim
  bottom.beginFill(PIPE_RIM);
  bottom.drawRect(0, screenHeight - (gapY + gapHeight), width, PIPE_RIM_HEIGHT);
  bottom.endFill();
  // Highlight
  bottom.beginFill(PIPE_HIGHLIGHT);
  bottom.drawRect(6, 8, 10, screenHeight - (gapY + gapHeight) - 16);
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