import { Application, Container, Text, TextStyle } from 'pixi.js';
import { GameScene } from '../types/game-scene';

export function createSplashScene(app: Application, onStart: () => void): GameScene {
  const sceneContainer = new Container();

  const titleStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 64,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 8 },
  });
  const title = new Text('Flappy Bird', titleStyle);
  title.anchor.set(0.5);
  title.x = app.screen.width / 2;
  title.y = app.screen.height / 3;
  sceneContainer.addChild(title);

  const startStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xffff00,
    stroke: { color: 0x000000, width: 6 },
  });
  const startText = new Text('Tap to Start', startStyle);
  startText.anchor.set(0.5);
  startText.x = app.screen.width / 2;
  startText.y = app.screen.height / 2 + 60;
  sceneContainer.addChild(startText);

  function handleStart() {
    onStart();
  }

  return {
    init() {
      app.stage.addChild(sceneContainer);
      app.view.addEventListener('pointerdown', handleStart);
    },
    update(_delta: number) {},
    destroy() {
      app.stage.removeChild(sceneContainer);
      sceneContainer.removeChildren();
      app.view.removeEventListener('pointerdown', handleStart);
    },
  };
} 