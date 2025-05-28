import { Application, Container, Text, TextStyle, Graphics } from 'pixi.js';
import { GameScene } from '../types/game-scene';

// --- Localization (simple demo) ---
const locale = navigator.language.startsWith('es') ? 'es' : 'en';
const TEXT = {
  en: {
    title: 'Flappy Bird',
    tapToStart: 'Tap to Start',
    mute: 'Mute',
    unmute: 'Unmute',
  },
  es: {
    title: 'Pájaro Saltarín',
    tapToStart: 'Toca para empezar',
    mute: 'Silenciar',
    unmute: 'Sonar',
  },
}[locale];

export function createSplashScene(app: Application, onStart: () => void): GameScene {
  const sceneContainer = new Container();

  // --- Parallax background ---
  const bgFar = new Graphics();
  bgFar.beginFill(0x87ceeb);
  bgFar.drawRect(0, 0, app.screen.width, app.screen.height);
  bgFar.endFill();
  sceneContainer.addChild(bgFar);
  const bgClouds = new Graphics();
  bgClouds.beginFill(0xffffff, 0.3);
  bgClouds.drawEllipse(100, 80, 60, 24);
  bgClouds.drawEllipse(300, 120, 80, 32);
  bgClouds.drawEllipse(600, 60, 50, 20);
  bgClouds.endFill();
  sceneContainer.addChild(bgClouds);
  const ground = new Graphics();
  ground.beginFill(0x4ec04e);
  ground.drawRect(0, app.screen.height - 40, app.screen.width, 40);
  ground.endFill();
  sceneContainer.addChild(ground);

  const titleStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 64,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 8 },
  });
  const title = new Text(TEXT.title, titleStyle);
  title.anchor.set(0.5);
  sceneContainer.addChild(title);

  const startStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xffff00,
    stroke: { color: 0x000000, width: 6 },
  });
  const startText = new Text(TEXT.tapToStart, startStyle);
  startText.anchor.set(0.5);
  startText.interactive = true;
  startText.cursor = 'pointer';
  sceneContainer.addChild(startText);

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
  const FADE_DURATION = 0.7 * 60; // 0.7s at 60fps

  function handleStart() {
    onStart();
  }

  function handleResize() {
    title.x = app.screen.width / 2;
    title.y = app.screen.height / 3;
    startText.x = app.screen.width / 2;
    startText.y = app.screen.height / 2 + 60;
    settingsText.x = app.screen.width - 12;
    settingsText.y = 12;
    bgFar.width = app.screen.width;
    bgFar.height = app.screen.height;
    ground.clear();
    ground.beginFill(0x4ec04e);
    ground.drawRect(0, app.screen.height - 40, app.screen.width, 40);
    ground.endFill();
  }

  return {
    init() {
      app.stage.addChild(sceneContainer);
      app.view.addEventListener('pointerdown', handleStart);
      startText.on('pointerdown', handleStart);
      window.addEventListener('resize', handleResize);
      fadeTime = 0;
      title.alpha = 0;
      startText.alpha = 0;
      handleResize();
      startMusic();
    },
    update(_delta: number) {
      if (fadeTime < FADE_DURATION) {
        fadeTime += _delta;
        const t = Math.min(1, fadeTime / FADE_DURATION);
        title.alpha = t;
        startText.alpha = t;
        bgClouds.x -= 0.2 * _delta;
        if (bgClouds.x < -200) bgClouds.x = 0;
      }
    },
    destroy() {
      app.stage.removeChild(sceneContainer);
      sceneContainer.removeChildren();
      app.view.removeEventListener('pointerdown', handleStart);
      startText.off('pointerdown', handleStart);
      window.removeEventListener('resize', handleResize);
      stopMusic();
    },
  };
} 