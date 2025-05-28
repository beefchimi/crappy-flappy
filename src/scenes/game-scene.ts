import { Application, Container, Text, TextStyle, Graphics } from 'pixi.js';
import { GameScene } from '../types/game-scene';
import { createBird, Bird, updateBird } from '../entities/bird-entity';
import { createPipe, getRandomGapY, Pipe } from '../entities/pipe-entity';
import { playSound } from '../assets/sounds';
import { createParticleSystem } from '../entities/particle-system';
import { createGameOverScene } from './game-over-scene';
import { SceneManager } from '../systems/scene-manager';
import { createSettingsMenu } from '../entities/settings-menu';
import { getSettings, subscribeSettings } from '../systems/settings';

const GRAVITY = 0.7;
let FLAP_STRENGTH = -10;
const PIPE_SPEED = 3;
const PIPE_INTERVAL = 90; // frames
const PIPE_GAP = 160;
const PIPE_WIDTH = 64;
const HIGH_SCORE_KEY = 'flappy-high-score';

// --- Localization (simple demo) ---
const locale = navigator.language.startsWith('es') ? 'es' : 'en';
const TEXT = {
  en: {
    title: 'Flappy Bird',
    tapToStart: 'Tap to Start',
    tapToRestart: 'Tap to Restart',
    gameOver: 'Game Over',
    newHighScore: 'New High Score!',
    score: 'Score',
    highScore: 'High Score',
    hint: 'Tap or press Space to flap',
    mute: 'Mute',
    unmute: 'Unmute',
    music: 'Music',
    sfx: 'SFX',
  },
  es: {
    title: 'Pájaro Saltarín',
    tapToStart: 'Toca para empezar',
    tapToRestart: 'Toca para reiniciar',
    gameOver: 'Fin del juego',
    newHighScore: '¡Nuevo récord!',
    score: 'Puntaje',
    highScore: 'Récord',
    hint: 'Toca o pulsa Espacio para saltar',
    mute: 'Silenciar',
    unmute: 'Sonar',
    music: 'Música',
    sfx: 'Efectos',
  },
}[locale];

function getHighScore(): number {
  return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
}

function setHighScore(score: number) {
  localStorage.setItem(HIGH_SCORE_KEY, String(score));
}

export function createGameScene(app: Application, sceneManager?: SceneManager): GameScene {
  const sceneContainer = new Container();

  // --- Official Flappy Bird style background ---
  const bgContainer = new Container();
  sceneContainer.addChild(bgContainer);
  const bgSky = new Graphics();
  bgSky.beginFill(0x70c5ce);
  bgSky.drawRect(0, 0, app.screen.width, app.screen.height);
  bgSky.endFill();
  bgContainer.addChild(bgSky);
  // Clouds (keep existing, but tweak for more puffy look)
  const bgClouds = new Graphics();
  bgClouds.beginFill(0xffffff, 0.9);
  bgClouds.drawEllipse(120, 80, 38, 18);
  bgClouds.drawEllipse(320, 120, 48, 22);
  bgClouds.drawEllipse(600, 60, 32, 14);
  bgClouds.endFill();
  bgContainer.addChild(bgClouds);
  // --- Official Flappy Bird style ground ---
  const ground = new Graphics();
  // Dirt base
  const GROUND_HEIGHT = 112;
  ground.beginFill(0xbca16b);
  ground.drawRect(0, app.screen.height - GROUND_HEIGHT, app.screen.width, GROUND_HEIGHT);
  ground.endFill();
  // Grass top
  const GRASS_HEIGHT = 28;
  ground.beginFill(0xded895);
  ground.drawRect(0, app.screen.height - GROUND_HEIGHT, app.screen.width, GRASS_HEIGHT);
  ground.endFill();
  // Grass bumps
  for (let x = 0; x < app.screen.width; x += 24) {
    ground.beginFill(0x79c850);
    ground.drawEllipse(x + 12, app.screen.height - GROUND_HEIGHT + 8, 12, 8);
    ground.endFill();
  }
  sceneContainer.addChild(ground);

  // Title text (placeholder)
  const titleStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xffffff,
  });
  const title = new Text(TEXT.title, titleStyle);
  // Center using pivot
  title.pivot.set(title.width / 2, title.height / 2);
  title.x = app.screen.width / 2;
  title.y = app.screen.height / 3;
  sceneContainer.addChild(title);

  // Score text (official style)
  const scoreStyle = new TextStyle({
    fontFamily: '"Press Start 2P", Arial, sans-serif',
    fontSize: 48,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 8 },
    letterSpacing: 2,
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
  const gameOverText = new Text(TEXT.gameOver, gameOverStyle);
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
  const newHighScoreText = new Text(TEXT.newHighScore, newHighScoreStyle);
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
  const hintText = new Text(TEXT.hint, hintStyle);
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

  // Particle system
  const particles = createParticleSystem();
  sceneContainer.addChild(particles.container);

  // Fade-in overlay
  const fadeOverlay = new Container();
  const fadeRect = new Graphics();
  fadeRect.beginFill(0x000000);
  fadeRect.drawRect(0, 0, app.screen.width, app.screen.height);
  fadeRect.endFill();
  fadeRect.alpha = 1;
  fadeOverlay.addChild(fadeRect);
  sceneContainer.addChild(fadeOverlay);
  let fadeTime = 0;
  const FADE_DURATION = 0.5 * 60; // 0.5s at 60fps
  let isFadingIn = true;
  let isFadingOut = false;
  let fadeOutCallback: (() => void) | null = null;

  // --- Settings button (mute/music/sfx) ---
  const settingsStyle = new TextStyle({
    fontFamily: 'Arial', fontSize: 20, fill: 0xffffff, stroke: { color: 0x000000, width: 4 },
  });
  const settingsText = new Text('⚙️', settingsStyle);
  settingsText.anchor.set(1, 0);
  settingsText.x = app.screen.width - 12;
  settingsText.y = 12;
  settingsText.interactive = true;
  settingsText.cursor = 'pointer';
  sceneContainer.addChild(settingsText);

  let isSettingsOpen = false;
  let settingsMenu: Container | null = null;

  settingsText.on('pointerdown', () => {
    if (isSettingsOpen) return;
    isSettingsOpen = true;
    settingsMenu = createSettingsMenu(app, () => {
      isSettingsOpen = false;
      if (settingsMenu) {
        sceneContainer.removeChild(settingsMenu);
        settingsMenu = null;
      }
      // Update audio and difficulty on close
      updateAudioFromSettings();
      updateDifficultyFromSettings();
    });
    sceneContainer.addChild(settingsMenu);
  });

  function updateAudioFromSettings() {
    const s = getSettings();
    isMuted = s.isMuted;
    isMusicOn = s.isMusicOn;
    isSfxOn = s.isSfxOn;
    if (isMuted) stopMusic();
    else if (isMusicOn) startMusic();
  }

  function updateDifficultyFromSettings() {
    const s = getSettings();
    switch (s.difficulty) {
      case 'easy':
        GRAVITY = 0.26;
        PIPE_SPEED = 1.7;
        PIPE_GAP = 260;
        FLAP_STRENGTH = -5.2;
        break;
      case 'hard':
        GRAVITY = 0.42;
        PIPE_SPEED = 2.7;
        PIPE_GAP = 150;
        FLAP_STRENGTH = -6.7;
        break;
      default:
        GRAVITY = 0.32;
        PIPE_SPEED = 2.1;
        PIPE_GAP = 200;
        FLAP_STRENGTH = -5.9;
    }
  }

  // Use settings for initial values
  let { isMuted, isMusicOn, isSfxOn } = getSettings();
  let GRAVITY = 0.7;
  let PIPE_SPEED = 3;
  let PIPE_GAP = 160;
  updateDifficultyFromSettings();

  // --- Simple background music (oscillator loop) ---
  let musicOsc: OscillatorNode | null = null;
  let musicGain: GainNode | null = null;
  function startMusic() {
    if (!isMusicOn || isMuted) return;
    if (!musicOsc) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      musicOsc = ctx.createOscillator();
      musicGain = ctx.createGain();
      musicOsc.type = 'triangle';
      musicOsc.frequency.value = 220;
      musicGain.gain.value = 0.08;
      musicOsc.connect(musicGain).connect(ctx.destination);
      musicOsc.start();
    }
  }
  function stopMusic() {
    if (musicOsc) {
      musicOsc.stop();
      musicOsc.disconnect();
      musicOsc = null;
    }
    if (musicGain) {
      musicGain.disconnect();
      musicGain = null;
    }
  }

  // --- Accessibility: ARIA live region for score ---
  let ariaLive = document.getElementById('aria-live');
  if (!ariaLive) {
    ariaLive = document.createElement('div');
    ariaLive.id = 'aria-live';
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-9999px';
    document.body.appendChild(ariaLive);
  }

  function updateHighScoreDisplay() {
    highScoreText.text = `${TEXT.highScore}: ${highScore}`;
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
    ariaLive!.textContent = `${TEXT.score}: ${score}`;
  }

  function onFlap() {
    if (isGameOver) {
      resetGame();
      return;
    }
    bird.velocity = FLAP_STRENGTH;
    updateBird(bird, true);
    playSound('flap');
    particles.emit(bird.sprite.x, bird.sprite.y, 0xffff00);
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
    settingsText.x = app.screen.width - 12;
    settingsText.y = 12;
    // Parallax/ground
    bgSky.width = app.screen.width;
    bgSky.height = app.screen.height;
    bgClouds.width = app.screen.width;
    ground.clear();
    // Dirt base
    ground.beginFill(0xbca16b);
    ground.drawRect(0, app.screen.height - GROUND_HEIGHT, app.screen.width, GROUND_HEIGHT);
    ground.endFill();
    // Grass top
    ground.beginFill(0xded895);
    ground.drawRect(0, app.screen.height - GROUND_HEIGHT, app.screen.width, GRASS_HEIGHT);
    ground.endFill();
    // Grass bumps
    for (let x = 0; x < app.screen.width; x += 24) {
      ground.beginFill(0x79c850);
      ground.drawEllipse(x + 12, app.screen.height - GROUND_HEIGHT + 8, 12, 8);
      ground.endFill();
    }
  }

  function fadeOutAndSwitch(next: () => void) {
    fadeRect.width = app.screen.width;
    fadeRect.height = app.screen.height;
    fadeRect.alpha = 0;
    fadeOverlay.visible = true;
    isFadingOut = true;
    fadeOutCallback = next;
    fadeTime = 0;
  }

  function goToGameOver() {
    if (sceneManager) {
      fadeOutAndSwitch(() => {
        sceneManager.changeScene(createGameOverScene(app, score, highScore, () => {
          sceneManager.changeScene(createGameScene(app, sceneManager));
        }));
      });
    } else {
      resetGame();
    }
  }

  return {
    init() {
      app.stage.addChild(sceneContainer);
      app.view.addEventListener('pointerdown', onFlapEvent);
      window.addEventListener('keydown', onFlapEvent);
      window.addEventListener('resize', handleResize);
      resetGame();
      handleResize();
      // Fade-in setup
      fadeRect.width = app.screen.width;
      fadeRect.height = app.screen.height;
      fadeRect.alpha = 1;
      fadeTime = 0;
      isFadingIn = true;
      fadeOverlay.visible = true;
      startMusic();
      updateAudioFromSettings();
      updateDifficultyFromSettings();
      subscribeSettings(() => {
        updateAudioFromSettings();
        updateDifficultyFromSettings();
      });
    },
    update(_delta: number) {
      if (isSettingsOpen) return; // Pause gameplay while settings open
      // Fade-in animation
      if (isFadingIn) {
        fadeTime += _delta;
        let t = Math.min(1, fadeTime / FADE_DURATION);
        fadeRect.alpha = 1 - t;
        if (t >= 1) {
          isFadingIn = false;
          fadeOverlay.visible = false;
        }
      }
      // Fade-out animation
      if (isFadingOut) {
        fadeTime += _delta;
        let t = Math.min(1, fadeTime / (0.4 * 60));
        fadeRect.alpha = t;
        if (t >= 1 && fadeOutCallback) {
          isFadingOut = false;
          fadeOverlay.visible = false;
          fadeOutCallback();
          fadeOutCallback = null;
        }
        return;
      }
      if (isGameOver || isFadingIn) return;
      // Gravity
      bird.velocity += GRAVITY;
      bird.sprite.y += bird.velocity;
      // Prevent bird from going off the bottom
      if (bird.sprite.y > app.screen.height - 24) {
        bird.sprite.y = app.screen.height - 24;
        bird.velocity = 0;
        isGameOver = true;
        playSound('hit');
        particles.emit(bird.sprite.x, bird.sprite.y, 0xff4444);
        goToGameOver();
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
          playSound('score');
          particles.emit(bird.sprite.x, bird.sprite.y, 0x4ec04e);
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
        playSound('hit');
        particles.emit(bird.sprite.x, bird.sprite.y, 0xff4444);
        goToGameOver();
      }
      // Particle system update
      particles.update(_delta);
      // Parallax background
      bgClouds.x -= 0.2 * _delta;
      if (bgClouds.x < -200) bgClouds.x = 0;
      // Animate bird
      updateBird(bird, false);
      // Accessibility: update ARIA live region
      ariaLive!.textContent = `${TEXT.score}: ${score}`;
    },
    destroy() {
      app.stage.removeChild(sceneContainer);
      sceneContainer.removeChildren();
      app.view.removeEventListener('pointerdown', onFlapEvent);
      window.removeEventListener('keydown', onFlapEvent);
      window.removeEventListener('resize', handleResize);
      pipes = [];
      // Clean up overlay
      fadeOverlay.removeChildren();
      stopMusic();
      if (settingsMenu) {
        sceneContainer.removeChild(settingsMenu);
        settingsMenu = null;
      }
    },
  };
} 