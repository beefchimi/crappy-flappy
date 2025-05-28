import { Application, Container, Text, TextStyle } from 'pixi.js';
import { GameScene } from '../types/game-scene';
import { createBird, Bird } from '../entities/bird-entity';

const GRAVITY = 0.7;
const FLAP_STRENGTH = -10;

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

  function onFlap() {
    bird.velocity = FLAP_STRENGTH;
  }

  return {
    init() {
      app.stage.addChild(sceneContainer);
      app.view.addEventListener('pointerdown', onFlap);
    },
    update(_delta: number) {
      // Gravity
      bird.velocity += GRAVITY;
      bird.sprite.y += bird.velocity;
      // Prevent bird from going off the bottom
      if (bird.sprite.y > app.screen.height - 24) {
        bird.sprite.y = app.screen.height - 24;
        bird.velocity = 0;
      }
      // Prevent bird from going off the top
      if (bird.sprite.y < 24) {
        bird.sprite.y = 24;
        bird.velocity = 0;
      }
    },
    destroy() {
      app.stage.removeChild(sceneContainer);
      sceneContainer.removeChildren();
      app.view.removeEventListener('pointerdown', onFlap);
    },
  };
} 