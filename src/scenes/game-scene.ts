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
const HIGH_SCORE_KEY = 'flappy-high-score';

function getHighScore(): number {
  return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
}

function setHighScore(score: number) {
  localStorage.setItem(HIGH_SCORE_KEY, String(score));
}

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

  // Score text
  const scoreStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 40,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 6 },
  });
  const scoreText = new Text('0', scoreStyle);
  scoreText.anchor.set(0.5, 0);
  scoreText.x = app.screen.width / 2;
  scoreText.y = 24;
  sceneContainer.addChild(scoreText);

  // High score text
  const highScoreStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffe066,
    stroke: { color: 0x000000, width: 4 },
  });
  const highScoreText = new Text('', highScoreStyle);
  highScoreText.anchor.set(0.5, 0);
  highScoreText.x = app.screen.width / 2;
  highScoreText.y = 70;
  sceneContainer.addChild(highScoreText);

  // Game over text
  const gameOverStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 56,
    fill: 0xff4444,
    stroke: { color: 0x000000, width: 8 },
  });
  const gameOverText = new Text('Game Over', gameOverStyle);
  gameOverText.anchor.set(0.5);
  gameOverText.x = app.screen.width / 2;
  gameOverText.y = app.screen.height / 2;
  gameOverText.visible = false;
  sceneContainer.addChild(gameOverText);

  // New high score text
  const newHighScoreStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 32,
    fill: 0x00ff99,
    stroke: { color: 0x000000, width: 6 },
  });
  const newHighScoreText = new Text('New High Score!', newHighScoreStyle);
  newHighScoreText.anchor.set(0.5);
  newHighScoreText.x = app.screen.width / 2;
  newHighScoreText.y = gameOverText.y + 60;
  newHighScoreText.visible = false;
  sceneContainer.addChild(newHighScoreText);

  // Mobile hint text
  const hintStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 20,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 4 },
  });
  const hintText = new Text('Tap or press Space to flap', hintStyle);
  hintText.anchor.set(0.5, 0);
  hintText.x = app.screen.width / 2;
  hintText.y = app.screen.height - 48;
  sceneContainer.addChild(hintText);

  // Bird entity
  const birdStartX = app.screen.width / 3;
  const birdStartY = app.screen.height / 2;
  const bird: Bird = createBird(birdStartX, birdStartY);
  sceneContainer.addChild(bird.sprite);

  // Pipes
  let pipes: Pipe[] = [];
  let frameCount = 0;
  let isGameOver = false;
  let score = 0;
  let highScore = getHighScore();
  let isNewHighScore = false;

  function updateHighScoreDisplay() {
    highScoreText.text = `High Score: ${highScore}`;
  }

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
    score = 0;
    scoreText.text = '0';
    highScore = getHighScore();
    updateHighScoreDisplay();
    gameOverText.visible = false;
    newHighScoreText.visible = false;
    isNewHighScore = false;
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

  function onFlapEvent(e: Event) {
    if (e instanceof KeyboardEvent && e.code !== 'Space') return;
    onFlap();
  }

  function handleResize() {
    // Center UI elements responsively
    title.x = app.screen.width / 2;
    title.y = app.screen.height / 3;
    scoreText.x = app.screen.width / 2;
    highScoreText.x = app.screen.width / 2;
    gameOverText.x = app.screen.width / 2;
    gameOverText.y = app.screen.height / 2;
    newHighScoreText.x = app.screen.width / 2;
    newHighScoreText.y = gameOverText.y + 60;
    hintText.x = app.screen.width / 2;
    hintText.y = app.screen.height - 48;
  }

  return {
    init() {
      app.stage.addChild(sceneContainer);
      app.view.addEventListener('pointerdown', onFlapEvent);
      window.addEventListener('keydown', onFlapEvent);
      window.addEventListener('resize', handleResize);
      resetGame();
      handleResize();
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
        gameOverText.visible = true;
        if (score > highScore) {
          highScore = score;
          setHighScore(highScore);
          updateHighScoreDisplay();
          isNewHighScore = true;
          newHighScoreText.visible = true;
        }
        return;
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
        // Score: check if bird passed the pipe
        if (!pipe.passed && pipe.container.x + pipe.width < bird.sprite.x) {
          pipe.passed = true;
          score++;
          scoreText.text = String(score);
          if (score > highScore) {
            highScore = score;
            setHighScore(highScore);
            updateHighScoreDisplay();
            isNewHighScore = true;
            newHighScoreText.visible = true;
          }
        }
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
        gameOverText.visible = true;
        if (score > highScore) {
          highScore = score;
          setHighScore(highScore);
          updateHighScoreDisplay();
          isNewHighScore = true;
          newHighScoreText.visible = true;
        }
      }
    },
    destroy() {
      app.stage.removeChild(sceneContainer);
      sceneContainer.removeChildren();
      app.view.removeEventListener('pointerdown', onFlapEvent);
      window.removeEventListener('keydown', onFlapEvent);
      window.removeEventListener('resize', handleResize);
      pipes = [];
    },
  };
} 