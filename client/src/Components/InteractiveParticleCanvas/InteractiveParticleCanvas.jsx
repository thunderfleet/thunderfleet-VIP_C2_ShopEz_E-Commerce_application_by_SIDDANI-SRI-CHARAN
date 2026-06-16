import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './InteractiveParticleCanvas.css';

// ─── Brand Palette ─────────────────────────────────────────────────────────────
// Per spec: rgba(255,255,255,.7)  rgba(140,180,255,.5)  rgba(170,120,255,.4)
// Alphas boosted slightly so particles read clearly on the light bg
const COLORS = [
  { r: 255, g: 255, b: 255, a: 0.85 },
  { r: 200, g: 210, b: 255, a: 0.70 },
  { r: 140, g: 180, b: 255, a: 0.75 }, // sky blue
  { r: 140, g: 180, b: 255, a: 0.55 },
  { r: 170, g: 120, b: 255, a: 0.70 }, // violet
  { r: 170, g: 120, b: 255, a: 0.50 },
  { r:  99, g: 102, b: 241, a: 0.65 }, // indigo-500
  { r: 196, g: 181, b: 253, a: 0.60 }, // violet-300
];

// ─── Physics Constants ──────────────────────────────────────────────────────────
const MOUSE_R    = 250;   // influence radius (px)
const ATTRACT    = 0.120; // soft gravity toward cursor
const SPRING     = 0.002; // spring back to origin
const DAMP       = 0.95;  // velocity friction per frame
const NOISE      = 0.150; // ambient micro-drift
const CONN_DIST  = 100;   // max distance for connection lines (px)
const MAX_CONN   = 3;     // max connection lines per particle
const MOUSE_R2   = MOUSE_R * MOUSE_R;
const CONN_DIST2 = CONN_DIST * CONN_DIST;

// ─── Responsive Density ─────────────────────────────────────────────────────────
const getCount = (pathname) => {
  const home = pathname === '/';
  const w = window.innerWidth;
  if (w < 480)  return home ? 55  : 28;
  if (w < 768)  return home ? 100 : 45;
  if (w < 1200) return home ? 160 : 65;
  return               home ? 220 : 90;
};

// ─── Particle Factory ───────────────────────────────────────────────────────────
const mkParticle = (W, H) => {
  const col = COLORS[Math.floor(Math.random() * COLORS.length)];
  const r   = Math.random() * 2.8 + 1.0; // 1.0 – 3.8 px core radius
  const x   = Math.random() * W;
  const y   = Math.random() * H;
  return {
    x, y,
    ox: x, oy: y,         // origin (home position)
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    r,
    gr: r * 7,             // glow halo radius (larger = more visible glow)
    col,                   // { r, g, b, a }
    phase: Math.random() * Math.PI * 2,
    ps:    Math.random() * 0.0006 + 0.0002, // pulse speed (rad/ms)
  };
};

// ─── Component ──────────────────────────────────────────────────────────────────
const InteractiveParticleCanvas = () => {
  const { pathname } = useLocation();

  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const lastMove  = useRef(0);
  const paused    = useRef(false);    // true when tab is hidden
  const world     = useRef({ particles: [], W: 0, H: 0 });

  // ── Build / rebuild particle field ───────────────────────────────────────────
  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = (canvas.width  = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    world.current = {
      particles: Array.from({ length: getCount(pathname) }, () => mkParticle(W, H)),
      W,
      H,
    };
  }, [pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    // Throttled mouse tracker (~72 fps cap = ~14 ms)
    const onMove = (e) => {
      const now = performance.now();
      if (now - lastMove.current < 14) return;
      lastMove.current = now;
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    // Pause RAF computation when the browser tab is hidden
    const onVis = () => { paused.current = document.hidden; };

    // ── RAF animation loop ──────────────────────────────────────────────────────
    const tick = (ts) => {
      rafRef.current = requestAnimationFrame(tick);

      // Skip draw (but keep RAF alive for smooth resume)
      if (paused.current) return;

      const { particles, W, H } = world.current;
      const { x: mx, y: my }   = mouse.current;

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // ── Mouse attraction (radial soft gravity) ──────────────────────────────
        const adx = mx - p.x;
        const ady = my - p.y;
        const ad2 = adx * adx + ady * ady;
        if (ad2 < MOUSE_R2 && ad2 > 0.01) {
          const d = Math.sqrt(ad2);
          // Force strongest near cursor, falls off linearly to edge of radius
          const f = ((MOUSE_R - d) / MOUSE_R) * ATTRACT;
          p.vx += (adx / d) * f;
          p.vy += (ady / d) * f;
        }

        // ── Spring back to home position ────────────────────────────────────────
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;

        // ── Ambient micro-drift ─────────────────────────────────────────────────
        p.vx += (Math.random() - 0.5) * NOISE;
        p.vy += (Math.random() - 0.5) * NOISE;

        // ── Damping + integrate ─────────────────────────────────────────────────
        p.vx *= DAMP;
        p.vy *= DAMP;
        p.x  += p.vx;
        p.y  += p.vy;

        // ── Breathing alpha pulse ───────────────────────────────────────────────
        const pulse = Math.sin(ts * p.ps + p.phase) * 0.15 + 0.88;
        const alpha = Math.min(p.col.a * pulse, 1);
        const { r: cr, g: cg, b: cb } = p.col;

        // ── Outer glow halo (radial gradient) ──────────────────────────────────
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.gr);
        g.addColorStop(0,   `rgba(${cr},${cg},${cb},${(alpha * 0.55).toFixed(3)})`);
        g.addColorStop(0.35,`rgba(${cr},${cg},${cb},${(alpha * 0.22).toFixed(3)})`);
        g.addColorStop(0.7, `rgba(${cr},${cg},${cb},${(alpha * 0.07).toFixed(3)})`);
        g.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.gr, 0, Math.PI * 2);
        ctx.fill();

        // ── Hard core dot ───────────────────────────────────────────────────────
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(alpha * 2.0, 1).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // ── Constellation connection lines ──────────────────────────────────────
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

        // ── Seamless edge wrap ──────────────────────────────────────────────────
        const MARGIN = 40;
        if (p.x < -MARGIN)     { p.x = W + MARGIN; p.ox = p.x; }
        if (p.x > W + MARGIN)  { p.x = -MARGIN;    p.ox = p.x; }
        if (p.y < -MARGIN)     { p.y = H + MARGIN;  p.oy = p.y; }
        if (p.y > H + MARGIN)  { p.y = -MARGIN;     p.oy = p.y; }
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
  }, [init]); // re-runs when `init` changes (i.e. on pathname change)

  return (
    <canvas
      ref={canvasRef}
      className="ipc-canvas"
      aria-hidden="true"
    />
  );
};

export default InteractiveParticleCanvas;
