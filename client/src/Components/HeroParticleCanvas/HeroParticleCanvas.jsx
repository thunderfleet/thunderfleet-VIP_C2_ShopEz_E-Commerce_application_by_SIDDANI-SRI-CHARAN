import React, { useEffect, useRef, useCallback } from 'react';
import './HeroParticleCanvas.css';

const COLORS = [
  { r: 255, g: 255, b: 255, a: 0.85 }, // White for contrast
  { r: 255, g: 200, b: 200, a: 0.70 },
  { r: 255, g: 80, b: 80, a: 0.75 }, // bright red
  { r: 255, g: 80, b: 80, a: 0.55 },
  { r: 220, g: 20, b: 60, a: 0.70 }, // crimson
  { r: 220, g: 20, b: 60, a: 0.50 },
  { r: 239, g: 68, b: 68, a: 0.65 }, // red-500
  { r: 252, g: 165, b: 165, a: 0.60 }, // red-300
];

const MOUSE_R    = 250;
const ATTRACT    = 0.120;
const SPRING     = 0.002;
const DAMP       = 0.95;
const NOISE      = 0.150;
const CONN_DIST  = 100;
const MAX_CONN   = 3;
const MOUSE_R2   = MOUSE_R * MOUSE_R;
const CONN_DIST2 = CONN_DIST * CONN_DIST;

const getCount = () => {
  const w = window.innerWidth;
  if (w < 480)  return 55;
  if (w < 768)  return 100;
  if (w < 1200) return 160;
  return 220;
};

const mkParticle = (W, H) => {
  const col = COLORS[Math.floor(Math.random() * COLORS.length)];
  const r   = Math.random() * 2.8 + 1.0; 
  const x   = Math.random() * W;
  const y   = Math.random() * H;
  return {
    x, y,
    ox: x, oy: y,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    r,
    gr: r * 7,
    col,
    phase: Math.random() * Math.PI * 2,
    ps:    Math.random() * 0.0006 + 0.0002,
  };
};

const HeroParticleCanvas = () => {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const lastMove  = useRef(0);
  const paused    = useRef(false);
  const world     = useRef({ particles: [], W: 0, H: 0 });

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    
    const W = (canvas.width  = parent.clientWidth);
    const H = (canvas.height = parent.clientHeight);
    world.current = {
      particles: Array.from({ length: getCount() }, () => mkParticle(W, H)),
      W,
      H,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    const onMove = (e) => {
      const now = performance.now();
      if (now - lastMove.current < 14) return;
      lastMove.current = now;
      
      const rect = canvas.getBoundingClientRect();
      mouse.current = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    const onVis = () => { paused.current = document.hidden; };

    const tick = (ts) => {
      rafRef.current = requestAnimationFrame(tick);
      if (paused.current) return;

      const { particles, W, H } = world.current;
      const { x: mx, y: my }   = mouse.current;

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const adx = mx - p.x;
        const ady = my - p.y;
        const ad2 = adx * adx + ady * ady;
        if (ad2 < MOUSE_R2 && ad2 > 0.01) {
          const d = Math.sqrt(ad2);
          const f = ((MOUSE_R - d) / MOUSE_R) * ATTRACT;
          p.vx += (adx / d) * f;
          p.vy += (ady / d) * f;
        }

        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;
        p.vx += (Math.random() - 0.5) * NOISE;
        p.vy += (Math.random() - 0.5) * NOISE;
        p.vx *= DAMP;
        p.vy *= DAMP;
        p.x  += p.vx;
        p.y  += p.vy;

        const pulse = Math.sin(ts * p.ps + p.phase) * 0.15 + 0.88;
        const alpha = Math.min(p.col.a * pulse, 1);
        const { r: cr, g: cg, b: cb } = p.col;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.gr);
        g.addColorStop(0,   `rgba(${cr},${cg},${cb},${(alpha * 0.55).toFixed(3)})`);
        g.addColorStop(0.35,`rgba(${cr},${cg},${cb},${(alpha * 0.22).toFixed(3)})`);
        g.addColorStop(0.7, `rgba(${cr},${cg},${cb},${(alpha * 0.07).toFixed(3)})`);
        g.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.gr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(alpha * 2.0, 1).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        let drawn = 0;
        for (let j = i + 1; j < particles.length && drawn < MAX_CONN; j++) {
          const q   = particles[j];
          const ldx = q.x - p.x;
          const ldy = q.y - p.y;
          const ld2 = ldx * ldx + ldy * ldy;
          if (ld2 < CONN_DIST2) {
            const lineAlpha = (1 - Math.sqrt(ld2) / CONN_DIST) * 0.30;
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${lineAlpha.toFixed(3)})`;
            ctx.lineWidth   = 0.7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            drawn++;
          }
        }

        const MARGIN = 40;
        if (p.x < -MARGIN)     { p.x = W + MARGIN; p.ox = p.x; }
        if (p.x > W + MARGIN)  { p.x = -MARGIN;    p.ox = p.x; }
        if (p.y < -MARGIN)     { p.y = H + MARGIN; p.oy = p.y; }
        if (p.y > H + MARGIN)  { p.y = -MARGIN;    p.oy = p.y; }
      }
    };

    init();
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener('resize',       init,    { passive: true });
    window.addEventListener('mousemove',    onMove,  { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',       init);
      window.removeEventListener('mousemove',    onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-ipc-canvas"
      aria-hidden="true"
    />
  );
};

export default HeroParticleCanvas;
