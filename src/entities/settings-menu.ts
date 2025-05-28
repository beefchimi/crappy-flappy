import { Application, Container, Text, TextStyle, Graphics } from 'pixi.js';
import { getSettings, setSettings, GameSettings, GameDifficulty } from '../systems/settings';

const locale = navigator.language.startsWith('es') ? 'es' : 'en';
const TEXT = {
  en: {
    settings: 'Settings',
    mute: 'Mute',
    music: 'Music',
    sfx: 'SFX',
    difficulty: 'Difficulty',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    close: 'Close',
  },
  es: {
    settings: 'Ajustes',
    mute: 'Silenciar',
    music: 'Música',
    sfx: 'Efectos',
    difficulty: 'Dificultad',
    easy: 'Fácil',
    normal: 'Normal',
    hard: 'Difícil',
    close: 'Cerrar',
  },
}[locale];

export function createSettingsMenu(app: Application, onClose: () => void): Container {
  const settings = getSettings();
  const menu = new Container();
  const bg = new Graphics();
  bg.beginFill(0x222222, 0.92);
  bg.drawRoundedRect(0, 0, Math.min(340, app.screen.width - 32), 340, 24);
  bg.endFill();
  menu.addChild(bg);

  // Title
  const titleStyle = new TextStyle({ fontFamily: 'Arial', fontSize: 32, fill: 0xffffff, stroke: { color: 0x000000, width: 6 } });
  const title = new Text(TEXT.settings, titleStyle);
  title.anchor.set(0.5, 0);
  title.x = bg.width / 2;
  title.y = 18;
  menu.addChild(title);

  // Mute toggle
  const muteStyle = new TextStyle({ fontFamily: 'Arial', fontSize: 24, fill: 0xffff00, stroke: { color: 0x000000, width: 4 } });
  const muteText = new Text(`${TEXT.mute}: ${settings.isMuted ? 'On' : 'Off'}`, muteStyle);
  muteText.anchor.set(0, 0);
  muteText.x = 32;
  muteText.y = 70;
  muteText.interactive = true;
  muteText.cursor = 'pointer';
  menu.addChild(muteText);

  // Music toggle
  const musicText = new Text(`${TEXT.music}: ${settings.isMusicOn ? 'On' : 'Off'}`, muteStyle);
  musicText.anchor.set(0, 0);
  musicText.x = 32;
  musicText.y = 110;
  musicText.interactive = true;
  musicText.cursor = 'pointer';
  menu.addChild(musicText);

  // SFX toggle
  const sfxText = new Text(`${TEXT.sfx}: ${settings.isSfxOn ? 'On' : 'Off'}`, muteStyle);
  sfxText.anchor.set(0, 0);
  sfxText.x = 32;
  sfxText.y = 150;
  sfxText.interactive = true;
  sfxText.cursor = 'pointer';
  menu.addChild(sfxText);

  // Difficulty
  const diffLabel = new Text(`${TEXT.difficulty}:`, muteStyle);
  diffLabel.anchor.set(0, 0);
  diffLabel.x = 32;
  diffLabel.y = 200;
  menu.addChild(diffLabel);

  const diffOptions: GameDifficulty[] = ['easy', 'normal', 'hard'];
  const diffButtons: Text[] = [];
  diffOptions.forEach((diff, i) => {
    const btn = new Text(TEXT[diff], new TextStyle({ fontFamily: 'Arial', fontSize: 22, fill: diff === settings.difficulty ? 0x00ff99 : 0xffffff, stroke: { color: 0x000000, width: 3 } }));
    btn.anchor.set(0, 0);
    btn.x = 48 + i * 90;
    btn.y = 240;
    btn.interactive = true;
    btn.cursor = 'pointer';
    btn.on('pointerdown', () => {
      setSettings({ difficulty: diff });
      diffButtons.forEach((b, j) => b.style.fill = diffOptions[j] === diff ? 0x00ff99 : 0xffffff);
    });
    diffButtons.push(btn);
    menu.addChild(btn);
  });

  // Close button
  const closeStyle = new TextStyle({ fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, stroke: { color: 0x000000, width: 4 } });
  const closeText = new Text(TEXT.close, closeStyle);
  closeText.anchor.set(0.5, 0);
  closeText.x = bg.width / 2;
  closeText.y = 300;
  closeText.interactive = true;
  closeText.cursor = 'pointer';
  closeText.on('pointerdown', () => onClose());
  menu.addChild(closeText);

  // Handlers
  muteText.on('pointerdown', () => {
    setSettings({ isMuted: !getSettings().isMuted });
    muteText.text = `${TEXT.mute}: ${getSettings().isMuted ? 'On' : 'Off'}`;
  });
  musicText.on('pointerdown', () => {
    setSettings({ isMusicOn: !getSettings().isMusicOn });
    musicText.text = `${TEXT.music}: ${getSettings().isMusicOn ? 'On' : 'Off'}`;
  });
  sfxText.on('pointerdown', () => {
    setSettings({ isSfxOn: !getSettings().isSfxOn });
    sfxText.text = `${TEXT.sfx}: ${getSettings().isSfxOn ? 'On' : 'Off'}`;
  });

  // Center menu
  menu.x = (app.screen.width - bg.width) / 2;
  menu.y = (app.screen.height - bg.height) / 2;

  return menu;
} 