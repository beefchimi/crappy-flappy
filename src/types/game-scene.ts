export interface GameScene {
  /** Called when the scene is added to the stage */
  init(): void;
  /** Called every frame with delta time */
  update(delta: number): void;
  /** Called when the scene is removed from the stage */
  destroy(): void;
} 