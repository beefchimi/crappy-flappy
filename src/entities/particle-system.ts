import { Container, Graphics } from 'pixi.js';

interface Particle {
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function createParticleSystem(): {
  container: Container;
  emit: (x: number, y: number, color?: number) => void;
  update: (delta: number) => void;
} {
  const container = new Container();
  const particles: Particle[] = [];
  const pool: Particle[] = [];

  function emit(x: number, y: number, color: number = 0xffff00) {
    for (let i = 0; i < 8; i++) {
      const p = pool.pop() || {
        gfx: new Graphics(),
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
      };
      p.gfx.clear();
      p.gfx.beginFill(color);
      p.gfx.drawCircle(0, 0, 4 + Math.random() * 2);
      p.gfx.endFill();
      p.gfx.alpha = 1;
      p.gfx.x = x;
      p.gfx.y = y;
      p.vx = (Math.random() - 0.5) * 2.5;
      p.vy = -2 - Math.random() * 1.5;
      p.life = 0;
      p.maxLife = 18 + Math.random() * 10;
      container.addChild(p.gfx);
      particles.push(p);
    }
  }

  function update(delta: number) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.gfx.x += p.vx * delta;
      p.gfx.y += p.vy * delta;
      p.vy += 0.08 * delta;
      p.life += delta;
      p.gfx.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        container.removeChild(p.gfx);
        pool.push(p);
        particles.splice(i, 1);
      }
    }
  }

  return { container, emit, update };
} 