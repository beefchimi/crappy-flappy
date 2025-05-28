import { Application, Container, Text, TextStyle } from 'pixi.js';

export function createGameScene(app: Application) {
  const scene = new Container();

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
  scene.addChild(title);

  app.stage.addChild(scene);
} 