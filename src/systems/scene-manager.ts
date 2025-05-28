import { Application, Ticker } from 'pixi.js';
import { GameScene } from '../types/game-scene';

export class SceneManager {
  private app: Application;
  private currentScene: GameScene | null = null;

  constructor(app: Application) {
    this.app = app;
    this.app.ticker.add(this.update, this);
  }

  changeScene(newScene: GameScene) {
    if (this.currentScene) {
      this.currentScene.destroy();
      // Remove all children from stage
      this.app.stage.removeChildren();
    }
    this.currentScene = newScene;
    this.currentScene.init();
    // Assume each scene adds its own container to the stage in init()
  }

  private update(ticker: Ticker) {
    if (this.currentScene) {
      this.currentScene.update(ticker.deltaTime);
    }
  }
} 