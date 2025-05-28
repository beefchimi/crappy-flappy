import { Application, Container, Text, TextStyle } from 'pixi.js';
import { GameScene } from '../types/game-scene';

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
  const overText = new Text('Game Over', overStyle);
  overText.anchor.set(0.5);
  overText.x = app.screen.width / 2;
  overText.y = app.screen.height / 3;
  sceneContainer.addChild(overText);

  const scoreStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 6 },
  });
  const scoreText = new Text(`Score: ${score}`, scoreStyle);
  scoreText.anchor.set(0.5);
  scoreText.x = app.screen.width / 2;
  scoreText.y = overText.y + 80;
  sceneContainer.addChild(scoreText);

  const highScoreStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 28,
    fill: 0xffe066,
    stroke: { color: 0x000000, width: 4 },
  });
  const highScoreText = new Text(`High Score: ${highScore}`, highScoreStyle);
  highScoreText.anchor.set(0.5);
  highScoreText.x = app.screen.width / 2;
  highScoreText.y = scoreText.y + 48;
  sceneContainer.addChild(highScoreText);

  const restartStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 32,
    fill: 0xffff00,
    stroke: { color: 0x000000, width: 6 },
  });
  const restartText = new Text('Tap to Restart', restartStyle);
  restartText.anchor.set(0.5);
  restartText.x = app.screen.width / 2;
  restartText.y = highScoreText.y + 70;
  sceneContainer.addChild(restartText);

  let fadeTime = 0;
  const FADE_DURATION = 0.7 * 60;

  function handleRestart() {
    onRestart();
  }

  return {
    init() {
      app.stage.addChild(sceneContainer);
      app.view.addEventListener('pointerdown', handleRestart);
      fadeTime = 0;
      overText.alpha = 0;
      scoreText.alpha = 0;
      highScoreText.alpha = 0;
      restartText.alpha = 0;
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
    },
  };
} 