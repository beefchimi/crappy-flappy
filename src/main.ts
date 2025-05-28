import { Application } from 'pixi.js';
import { createGameScene } from './scenes/game-scene';

async function startGame() {
  const app = new Application({
    resizeTo: window,
    backgroundColor: 0x70c5ce,
    antialias: true,
  });
  await app.init();

  document.getElementById('game-container')?.appendChild(app.view as HTMLCanvasElement);

  createGameScene(app);

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });
}

startGame(); 