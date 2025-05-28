import { Application, Container, Text, TextStyle } from 'pixi.js';
import { GameScene } from '../types/game-scene';
import { createBird, Bird } from '../entities/bird-entity';
import { createPipe, getRandomGapY, Pipe } from '../entities/pipe-entity';

const GRAVITY = 0.7;
const FLAP_STRENGTH = -10;
const PIPE_SPEED = 3;
const PIPE_INTERVAL = 90; // frames
const PIPE_GAP = 160;
const PIPE_WIDTH = 64;

export function createGameScene(app: Application): GameScene {
  const sceneContainer = new Container();

  // Title text (placeholder)
  const titleStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xffffff,
  });
  const title = new Text('Flappy Bird', titleStyle);
  // Center using pivot
  title.pivot.set(title.width / 2, title.height / 2);
  title.x = app.screen.width / 2;
  title.y = app.screen.height / 3;
  sceneContainer.addChild(title);

  // Bird entity
  const birdStartX = app.screen.width / 3;
  const birdStartY = app.screen.height / 2;
  const bird: Bird = createBird(birdStartX, birdStartY);
  sceneContainer.addChild(bird.sprite);

  // Pipes
  let pipes: Pipe[] = [];
  let frameCount = 0;
  let isGameOver = false;

  function spawnPipe() {
    const gapY = getRandomGapY(app.screen.height, PIPE_GAP);
    const pipe = createPipe(app.screen.width, app.screen.height, gapY, PIPE_GAP, PIPE_WIDTH);
    pipes.push(pipe);
    sceneContainer.addChild(pipe.container);
  }

  function resetGame() {
    // Reset bird
    bird.sprite.x = birdStartX;
    bird.sprite.y = birdStartY;
    bird.velocity = 0;
    // Remove pipes
    for (const pipe of pipes) {
      sceneContainer.removeChild(pipe.container);
    }
    pipes = [];
    frameCount = 0;
    isGameOver = false;
  }

  function onFlap() {
    if (isGameOver) {
      resetGame();
      return;
    }
    bird.velocity = FLAP_STRENGTH;
  }

  function checkCollision(): boolean {
    // Bird bounds
    const birdRadius = 24;
    const birdX = bird.sprite.x;
    const birdY = bird.sprite.y;
    for (const pipe of pipes) {
      const px = pipe.container.x;
      // Top pipe
      if (
        birdX + birdRadius > px &&
        birdX - birdRadius < px + pipe.width &&
        birdY - birdRadius < pipe.gapY
      ) {
        return true;
      }
      // Bottom pipe
      if (
        birdX + birdRadius > px &&
        birdX - birdRadius < px + pipe.width &&
        birdY + birdRadius > pipe.gapY + pipe.gapHeight
      ) {
        return true;
      }
    }
    return false;
  }

  return {
    init() {
      app.stage.addChild(sceneContainer);
      app.view.addEventListener('pointerdown', onFlap);
      resetGame();
    },
    update(_delta: number) {
      if (isGameOver) return;
      // Gravity
      bird.velocity += GRAVITY;
      bird.sprite.y += bird.velocity;
      // Prevent bird from going off the bottom
      if (bird.sprite.y > app.screen.height - 24) {
        bird.sprite.y = app.screen.height - 24;
        bird.velocity = 0;
        isGameOver = true;
      }
      // Prevent bird from going off the top
      if (bird.sprite.y < 24) {
        bird.sprite.y = 24;
        bird.velocity = 0;
      }
      // Pipes
      frameCount++;
      if (frameCount % PIPE_INTERVAL === 0) {
        spawnPipe();
      }
      for (const pipe of pipes) {
        pipe.container.x -= PIPE_SPEED;
      }
      // Remove off-screen pipes
      pipes = pipes.filter(pipe => {
        if (pipe.container.x + pipe.width < 0) {
          sceneContainer.removeChild(pipe.container);
          return false;
        }
        return true;
      });
      // Collision
      if (checkCollision()) {
        isGameOver = true;
      }
    },
    destroy() {
      app.stage.removeChild(sceneContainer);
      sceneContainer.removeChildren();
      app.view.removeEventListener('pointerdown', onFlap);
      pipes = [];
    },
  };
} 