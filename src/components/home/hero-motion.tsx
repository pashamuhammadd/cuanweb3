"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

type SceneKey = "radar" | "flow";

const SCENES: Record<SceneKey, { index: string; label: string; describe: string }> = {
  radar: {
    index: "01",
    label: "Radar peluang",
    describe:
      "Radar peluang: sapuan radar emas berputar dan menyalakan titik kategori airdrop, bounty, jobs, grants, testnet dan hackathon.",
  },
  flow: {
    index: "02",
    label: "Arus cuan",
    describe:
      "Arus cuan: tujuh kategori peluang tersusun mengelilingi koin CuanWeb3, dengan denyut cahaya mengalir ke pusat.",
  },
};

const TAU = Math.PI * 2;
const GOLD = "#f4bd35";
const GOLD_LIGHT = "#ffd877";
const GOLD_DEEP = "#c8931a";
const TEAL_LIGHT = "#3fc1b4";
const CHARCOAL = "#0c1117";
const RING_DIM = "#1d3836";
const RING_MID = "#2f6b66";
const TEXT = "#c9d8d4";
const TEXT_DIM = "#6f8f8a";

/** Titik kategori pada radar: sudut (rad) dan jari-jari (satuan logis). */
const RADAR_BLIPS = [
  { label: "AIRDROP", angle: -2.35, r: 74 },
  { label: "BOUNTY", angle: -0.95, r: 98 },
  { label: "JOBS", angle: 0.25, r: 60 },
  { label: "GRANTS", angle: 1.25, r: 100 },
  { label: "TESTNET", angle: 2.3, r: 86 },
  { label: "HACKATHON", angle: 3.35, r: 50 },
];

const FLOW_NODES = [
  { name: "Airdrop", short: "AIR" },
  { name: "Giveaway", short: "GIV" },
  { name: "Bounty", short: "BTY" },
  { name: "Web3 Jobs", short: "JOB" },
  { name: "Hackathon", short: "HAX" },
  { name: "Grants", short: "GRT" },
  { name: "Testnet", short: "TST" },
];

function polar(r: number, a: number): [number, number] {
  return [r * Math.cos(a), r * Math.sin(a)];
}

/** Cadangan statis bila canvas tidak tersedia. */
function StaticRadar({ label }: { label: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="-230 -145 460 290"
      className="block aspect-[1.3] w-full sm:aspect-[1.4]"
    >
      <circle r="128" fill="none" stroke={RING_DIM} />
      <circle r="110" fill="none" stroke={RING_MID} strokeWidth="1.6" />
      <circle r="70" fill="none" stroke={RING_DIM} />
      {RADAR_BLIPS.map((b) => {
        const [x, y] = polar(b.r, b.angle);
        return <circle key={b.label} cx={x} cy={y} r="4" fill={GOLD} />;
      })}
      <circle r="22" fill={GOLD} />
      <text
        y="1"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="22"
        fontWeight="800"
        fill={CHARCOAL}
      >
        C
      </text>
    </svg>
  );
}

export function HeroMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<SceneKey>("radar");
  const [noCanvas, setNoCanvas] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const sceneRef = useRef(scene);
  const reducedRef = useRef(reduced);
  const restartRef = useRef<() => void>(() => {});

  useEffect(() => {
    sceneRef.current = scene;
    reducedRef.current = reduced;
    restartRef.current();
  }, [scene, reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let maybeCtx: CanvasRenderingContext2D | null = null;
    try {
      maybeCtx = canvas.getContext("2d");
    } catch {
      maybeCtx = null;
    }
    if (!maybeCtx) {
      // Canvas tidak didukung: tampilkan SVG statis.
      queueMicrotask(() => setNoCanvas(true));
      return;
    }
    const ctx: CanvasRenderingContext2D = maybeCtx;
    const font = getComputedStyle(canvas).fontFamily || "ui-monospace, monospace";

    let t = 0;
    let last = 0;
    let raf = 0;
    let visible = true;

    const stroke = (pts: [number, number][], color: string, width = 1, close = false) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      if (close) ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };
    const ring = (r: number, color: string, width = 1, a0 = 0, a1 = TAU) => {
      ctx.beginPath();
      ctx.arc(0, 0, r, a0, a1);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };
    const dot = (x: number, y: number, r: number, color: string | CanvasGradient) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = color;
      ctx.fill();
    };
    const text = (
      s: string,
      x: number,
      y: number,
      color: string,
      size: number,
      align: CanvasTextAlign = "left",
      weight = 500,
    ) => {
      ctx.font = `${weight} ${size}px ${font}`;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.fillText(s, x, y);
    };
    const coin = (r: number) => {
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 2, 0, 0, r);
      g.addColorStop(0, GOLD_LIGHT);
      g.addColorStop(1, GOLD);
      dot(0, 0, r, g);
      ring(r, GOLD_DEEP, 1.4);
      ring(r - 4, "rgba(12,17,23,0.35)", 1);
      text("C", 0, 1, CHARCOAL, r * 1.05, "center", 800);
    };

    function drawRadar(fontSize: number, halfWidth: number) {
      const sweep = t * 0.85;

      // Cincin luar dan tanda arah mata angin.
      for (let i = 0; i < 4; i++) {
        const a = (i * TAU) / 4;
        stroke([polar(118, a), polar(140, a)], RING_MID, 1.2);
      }
      ring(128, RING_DIM, 1);
      ring(110, RING_MID, 1.6);
      ring(70, RING_DIM, 1);
      ring(40, RING_DIM, 1);

      // Cincin bergerigi yang berputar pelan berlawanan arah.
      for (let i = 0; i < 72; i++) {
        const a = (i * TAU) / 72 - t * 0.06;
        const major = i % 6 === 0;
        stroke([polar(106, a), polar(major ? 96 : 100, a)], major ? "#8fb8ae" : "#2c4a46", major ? 1.2 : 1);
      }
      // Busur emas pada cincin luar.
      for (let i = 0; i < 3; i++) {
        const a = t * 0.12 + (i * TAU) / 3;
        ring(119, "rgba(244,189,53,0.55)", 2, a, a + 0.6);
      }

      // Sapuan radar: irisan bertingkat yang memudar ke belakang.
      const slices = 28;
      const spread = 1.1;
      for (let i = 0; i < slices; i++) {
        const a1 = sweep - (i * spread) / slices;
        const a0 = a1 - spread / slices - 0.004;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 110, a0, a1);
        ctx.closePath();
        ctx.fillStyle = `rgba(244,189,53,${(0.22 * (1 - i / slices) ** 1.6).toFixed(3)})`;
        ctx.fill();
      }
      stroke([[0, 0], polar(110, sweep)], GOLD, 1.4);

      // Titik kategori menyala saat tersapu.
      for (const b of RADAR_BLIPS) {
        const behind = (((sweep - b.angle) % TAU) + TAU) % TAU;
        const glow = Math.exp(-behind * 1.4);
        const [x, y] = polar(b.r, b.angle);
        if (glow > 0.02) {
          ctx.beginPath();
          ctx.arc(x, y, 5 + 12 * (1 - glow), 0, TAU);
          ctx.strokeStyle = `rgba(244,189,53,${(0.7 * glow).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        dot(x, y, 2.6 + 2 * glow, glow > 0.15 ? GOLD_LIGHT : TEAL_LIGHT);
        const right = x >= 0;
        ctx.globalAlpha = 0.4 + 0.6 * glow;
        text(b.label, x + (right ? 9 : -9), y, TEXT, fontSize * 0.92, right ? "left" : "right");
        ctx.globalAlpha = 1;
      }

      coin(22 + 1.2 * Math.sin(t * 1.6));

      // Label pojok dengan garis penunjuk.
      ctx.font = `500 ${fontSize}px ${font}`;
      const limit = halfWidth - 8;
      const wA = ctx.measureText("SCAN / 06").width;
      const wB = ctx.measureText("RADAR PELUANG").width;
      const xA = Math.min(170, limit - wA);
      const xB = Math.max(-170, -limit + wB);
      stroke([[80, -84], [104, -112], [Math.max(110, xA - 2), -112]], RING_MID);
      text("SCAN / 06", xA, -112, TEXT_DIM, fontSize);
      stroke([[-80, 84], [-104, 112], [Math.min(-110, xB + 2), 112]], RING_MID);
      text("RADAR PELUANG", xB, 112, TEXT_DIM, fontSize, "right");
    }

    function drawFlow(fontSize: number, compact: boolean) {
      const rx = compact ? 150 : 165;
      const ry = 104;
      const n = FLOW_NODES.length;
      for (let i = 0; i < n; i++) {
        const a = (i * TAU) / n - Math.PI / 2;
        const x = rx * Math.cos(a);
        const y = ry * Math.sin(a);
        const bend: [number, number] = [x * 0.52, y * 0.18];
        stroke([[x, y], bend, [0, 0]], "#1f4a46", 1.4);

        // Denyut bergerak dari kategori menuju koin pusat.
        const p = (t * 0.3 + i / n) % 1;
        const from = p < 0.5 ? [x, y] : bend;
        const to = p < 0.5 ? bend : [0, 0];
        const k = p < 0.5 ? p * 2 : (p - 0.5) * 2;
        dot(from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, 2.4, GOLD_LIGHT);

        dot(x, y, 5.5, "#131c22");
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, TAU);
        ctx.strokeStyle = TEAL_LIGHT;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        const top = y < -60;
        text(compact ? FLOW_NODES[i].short : FLOW_NODES[i].name, x, y + (top ? -17 : 19), TEXT, fontSize, "center");
      }
      ring(30 + 2.5 * Math.sin(t * 2), "rgba(244,189,53,0.35)", 1);
      ring(38 + 2 * Math.sin(t * 2 + 1), "rgba(37,140,131,0.4)", 1);
      coin(22);
    }

    function draw() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(rect.width * dpr));
      const H = Math.max(1, Math.round(rect.height * dpr));
      if (canvas!.width !== W || canvas!.height !== H) {
        canvas!.width = W;
        canvas!.height = H;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Latar titik-titik yang memudar dari tengah.
      const step = 16 * dpr;
      const size = Math.max(1, Math.round(dpr));
      const reach = 0.62 * Math.min(W, H);
      for (let x = step / 2; x < W; x += step) {
        for (let y = step / 2; y < H; y += step) {
          const f = 1 - Math.hypot(x - W / 2, y - H / 2) / reach;
          if (f <= 0) continue;
          ctx.fillStyle = `rgba(37,140,131,${(0.6 * f).toFixed(3)})`;
          ctx.fillRect(x, y, size, size);
        }
      }

      const scale = Math.min(W / 460, H / 290);
      ctx.setTransform(scale, 0, 0, scale, W / 2, H / 2);
      const cssScale = scale / dpr;
      const fontSize = Math.max(10, 9.5 / cssScale);
      if (sceneRef.current === "radar") drawRadar(fontSize, W / 2 / scale);
      else drawFlow(Math.max(10, 9.5 / cssScale), cssScale < 0.85);
    }

    const shouldRun = () => !reducedRef.current && !document.hidden && visible;

    function frame(now: number) {
      raf = 0;
      if (last) t += Math.min((now - last) / 1000, 0.05);
      last = now;
      draw();
      if (shouldRun()) raf = requestAnimationFrame(frame);
    }

    function restart() {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      draw();
      if (shouldRun()) raf = requestAnimationFrame(frame);
    }
    restartRef.current = restart;

    const ro = new ResizeObserver(() => {
      if (!raf) draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        restart();
      },
      { threshold: 0 },
    );
    io.observe(wrap);
    document.addEventListener("visibilitychange", restart);
    restart();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", restart);
      restartRef.current = () => {};
    };
  }, []);

  const current = SCENES[scene];

  return (
    <div ref={wrapRef} className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-10%] bg-[radial-gradient(closest-side,rgba(244,189,53,0.12),rgba(37,140,131,0.08)_55%,transparent)]"
      />
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between font-mono text-[0.7rem] tracking-wide text-muted-foreground sm:text-xs">
          <span className="flex items-center gap-2 text-offwhite/80">
            <span aria-hidden="true" className="chip-dot h-1.5 w-1.5 rounded-full bg-gold" />
            Pemindai cuan
          </span>
          <span aria-live="polite">
            {current.index} / {current.label}
          </span>
        </div>
        {noCanvas ? (
          <StaticRadar label={current.describe} />
        ) : (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={current.describe}
            className="block aspect-[1.3] w-full font-mono sm:aspect-[1.4]"
          />
        )}
      </div>
      <div
        role="group"
        aria-label="Pilih animasi hero"
        className="relative mx-auto mt-1 flex w-full max-w-[22rem] items-stretch gap-1 rounded-full border border-border-strong bg-surface/80 p-1 font-mono text-[0.72rem] backdrop-blur sm:text-[0.78rem]"
      >
        {(Object.keys(SCENES) as SceneKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={scene === key}
            onClick={() => setScene(key)}
            className="min-h-10 flex-1 rounded-full px-2 leading-tight text-muted-foreground transition-colors hover:text-offwhite aria-pressed:bg-gold aria-pressed:font-semibold aria-pressed:text-charcoal"
          >
            {SCENES[key].label}
          </button>
        ))}
      </div>
    </div>
  );
}
