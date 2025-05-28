import { Application, Container, Text, TextStyle } from 'pixi.js';
import { GameScene } from '../types/game-scene';

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

  return {
    init() {
      app.stage.addChild(sceneContainer);
    },
    update(_delta: number) {
      // Game update logic will go here
    },
    destroy() {
      app.stage.removeChild(sceneContainer);
      sceneContainer.removeChildren();
    },
  };
} 