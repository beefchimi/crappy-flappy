import { Application, Container, Text, TextStyle } from 'pixi.js';
import { GameScene } from '../types/game-scene';

// --- Localization (simple demo) ---
const locale = navigator.language.startsWith('es') ? 'es' : 'en';
const TEXT = {
  en: {
    gameOver: 'Game Over',
    score: 'Score',
    highScore: 'High Score',
    tapToRestart: 'Tap to Restart',
    mute: 'Mute',
    unmute: 'Unmute',
  },
  es: {
    gameOver: 'Fin del juego',
    score: 'Puntaje',
    highScore: 'Récord',
    tapToRestart: 'Toca para reiniciar',
    mute: 'Silenciar',
    unmute: 'Sonar',
  },
}[locale];

export function createGameOverScene(
  app: Application,
  score: number,
  highScore: number,
  onRestart: () => void
): GameScene {
  const sceneContainer = new Container();

  const overStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 56,
    fill: 0xff4444,
    stroke: { color: 0x000000, width: 8 },
  });
  const overText = new Text(TEXT.gameOver, overStyle);
  overText.anchor.set(0.5);
  sceneContainer.addChild(overText);

  const scoreStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 6 },
  });
  const scoreText = new Text(`${TEXT.score}: ${score}`, scoreStyle);
  scoreText.anchor.set(0.5);
  sceneContainer.addChild(scoreText);

  const highScoreStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 28,
    fill: 0xffe066,
    stroke: { color: 0x000000, width: 4 },
  });
  const highScoreText = new Text(`${TEXT.highScore}: ${highScore}`, highScoreStyle);
  highScoreText.anchor.set(0.5);
  sceneContainer.addChild(highScoreText);

  const restartStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 32,
    fill: 0xffff00,
    stroke: { color: 0x000000, width: 6 },
  });
  const restartText = new Text(TEXT.tapToRestart, restartStyle);
  restartText.anchor.set(0.5);
  restartText.interactive = true;
  restartText.cursor = 'pointer';
  sceneContainer.addChild(restartText);

  // --- Settings button (mute/music) ---
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
  let isMuted = false;
  let isMusicOn = true;
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
  settingsText.on('pointerdown', () => {
    isMuted = !isMuted;
    if (isMuted) {
      stopMusic();
      settingsText.text = '🔇';
    } else {
      if (isMusicOn) startMusic();
      settingsText.text = '⚙️';
    }
  });

  let fadeTime = 0;
  const FADE_DURATION = 0.7 * 60;

  function handleRestart() {
    onRestart();
  }

  function handleResize() {
    overText.x = app.screen.width / 2;
    overText.y = app.screen.height / 3;
    scoreText.x = app.screen.width / 2;
    scoreText.y = overText.y + 80;
    highScoreText.x = app.screen.width / 2;
    highScoreText.y = scoreText.y + 48;
    restartText.x = app.screen.width / 2;
    restartText.y = highScoreText.y + 70;
    settingsText.x = app.screen.width - 12;
    settingsText.y = 12;
  }

  return {
    init() {
      app.stage.addChild(sceneContainer);
      app.view.addEventListener('pointerdown', handleRestart);
      restartText.on('pointerdown', handleRestart);
      window.addEventListener('resize', handleResize);
      fadeTime = 0;
      overText.alpha = 0;
      scoreText.alpha = 0;
      highScoreText.alpha = 0;
      restartText.alpha = 0;
      handleResize();
      startMusic();
    },
    update(_delta: number) {
      if (fadeTime < FADE_DURATION) {
        fadeTime += _delta;
        const t = Math.min(1, fadeTime / FADE_DURATION);
        overText.alpha = t;
        scoreText.alpha = t;
        highScoreText.alpha = t;
        restartText.alpha = t;
      }
    },
    destroy() {
      app.stage.removeChild(sceneContainer);
      sceneContainer.removeChildren();
      app.view.removeEventListener('pointerdown', handleRestart);
      restartText.off('pointerdown', handleRestart);
      window.removeEventListener('resize', handleResize);
      stopMusic();
    },
  };
} 