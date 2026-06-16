import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './InteractiveParticleBackground.css';

// ShopEz brand palette as [r, g, b] triplets
const PALETTE = [
  [79,  70,  229],  // indigo-600
  [99,  102, 241],  // indigo-500
  [139, 92,  246],  // violet-500
  [167, 139, 250],  // violet-400
  [59,  130, 246],  // blue-500
  [147, 197, 253],  // blue-300
  [196, 181, 253],  // violet-300
  [224, 231, 255],  // indigo-100 (near-white)
  [255, 255, 255],  // white accent
];

// Physics constants
const MOUSE_RADIUS   = 140;   // px — influence zone
const REPEL_STRENGTH = 0.55;  // how hard particles push away
const RETURN_EASE    = 0.014; // spring stiffness back to origin
const DAMPING        = 0.87;  // velocity bleed-off (< 1 = friction)
const DRIFT_NOISE    = 0.018; // tiny random ambient motion

const getParticleCount = (pathname) => {
  const isHome = pathname === '/';
  const w = window.innerWidth;
  if (w < 480)  return isHome ? 50  : 22;
  if (w < 768)  return isHome ? 85  : 35;
  if (w < 1200) return isHome ? 140 : 55;
  return               isHome ? 210 : 80;
};

const makeParticle = (W, H) => {
  const rgb   = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const alpha = Math.random() * 0.42 + 0.07;
  const r     = Math.random() * 2.4  + 0.5;
  const x     = Math.random() * W;
  const y     = Math.random() * H;
  return {
    x, y,
    originX: x,
    originY: y,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    r,
    glowR: r * 4.5,
    rgb,
    alpha,
    phase:     Math.random() * Math.PI * 2,
    pulseRate: Math.random() * 0.0007 + 0.0002, // rad/ms → slow gentle pulse
  };
};

const InteractiveParticleBackground = () => {
  const { pathname } = useLocation();
  const canvasRef   = useRef(null);
  const rafRef      = useRef(null);
  const mouseRef    = useRef({ x: -9999, y: -9999 });
  const stateRef    = useRef({ particles: [], W: 0, H: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ── Resize ──────────────────────────────────────────────────────────────
    const resize = () => {
      const W = canvas.width  = window.innerWidth;
      const H = canvas.height = window.innerHeight;
      const n = getParticleCount(pathname);
      stateRef.current = {
        particles: Array.from({ length: n }, () => makeParticle(W, H)),
        W,
        H,
      };
    };

    // ── Mouse tracking ───────────────────────────────────────────────────────
    const onMove  = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = ()  => { mouseRef.current = { x: -9999,     y: -9999     }; };

    // ── Animation loop ───────────────────────────────────────────────────────
    const tick = (ts) => {
      const { particles, W, H } = stateRef.current;
      const { x: mx, y: my }   = mouseRef.current;

      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        // ── Mouse repulsion ──────────────────────────────────────────────────
        const dx  = p.x - mx;
        const dy  = p.y - my;
        const d2  = dx * dx + dy * dy;
        const r2  = MOUSE_RADIUS * MOUSE_RADIUS;

        if (d2 < r2 && d2 > 0.01) {
          const d     = Math.sqrt(d2);
          const force = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * REPEL_STRENGTH;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }

        // ── Spring back to origin ────────────────────────────────────────────
        p.vx += (p.originX - p.x) * RETURN_EASE;
        p.vy += (p.originY - p.y) * RETURN_EASE;

        // ── Ambient drift noise ──────────────────────────────────────────────
        p.vx += (Math.random() - 0.5) * DRIFT_NOISE;
        p.vy += (Math.random() - 0.5) * DRIFT_NOISE;

        // ── Apply physics ────────────────────────────────────────────────────
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;

        // ── Breathing pulse ──────────────────────────────────────────────────
        const pulse = Math.sin(ts * p.pulseRate + p.phase) * 0.18 + 0.85;
        const a     = Math.min(p.alpha * pulse, 1);

        const [r, g, b] = p.rgb;

        // ── Draw: outer glow ─────────────────────────────────────────────────
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowR);
        grad.addColorStop(0, `rgba(${r},${g},${b},${(a * 0.38).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowR, 0, 6.2832);
        ctx.fill();

        // ── Draw: hard core dot ──────────────────────────────────────────────
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(a * 1.7, 1).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();

        // ── Wrap edges (seamless) ────────────────────────────────────────────
        if (p.x < -30) { p.x = W + 30; p.originX = p.x; }
        if (p.x > W + 30) { p.x = -30; p.originX = p.x; }
        if (p.y < -30) { p.y = H + 30; p.originY = p.y; }
        if (p.y > H + 30) { p.y = -30; p.originY = p.y; }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener('resize',    resize,  { passive: true });
    window.addEventListener('mousemove', onMove,  { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',    resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [pathname]); // re-init on route change to update density

  return (
    <canvas
      ref={canvasRef}
      className="ipb-canvas"
      aria-hidden="true"
    />
  );
};

export default InteractiveParticleBackground;
