/* global AFRAME, THREE */

/* ------------------------------------------------------------------
 * El laboratorio de Frankenstein — escena VR procedural.
 * Toda la geometría, las texturas y el sonido se generan aquí:
 * no se descarga ningún modelo, así carga rápido en Meta Quest.
 *
 * Coordenadas (metros): suelo en y = 0. Habitación x ∈ [-4, 4],
 * z ∈ [-5, 4], techo a 4.2 m. La mesa de operaciones está en z = -1.8
 * y la ventana de la tormenta en la pared del fondo (z = -5).
 * ------------------------------------------------------------------ */

const ROOM = { x: 4, zBack: -5, zFront: 4, h: 4.2 };
const CYCLE = 24; // segundos entre descargas sobre la mesa

/* ----------------------------- utilidades ---------------------------- */

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  return c;
}

function canvasTexture(canvas, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  return t;
}

function speckle(ctx, w, h, count, alpha) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha * 0.6})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, rand(1, 3), rand(1, 3));
  }
}

/* ------------------------- texturas procedurales -------------------- */

function stoneCanvas() {
  return makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#1b1814';
    ctx.fillRect(0, 0, w, h);
    const rowH = 64;
    for (let r = 0; r < h / rowH; r++) {
      let x = -rand(0, 120);
      while (x < w) {
        const bw = rand(96, 170);
        const l = rand(13, 21);
        ctx.fillStyle = `hsl(${rand(25, 40)}, ${rand(6, 14)}%, ${l}%)`;
        ctx.fillRect(x + 3, r * rowH + 3, bw - 6, rowH - 6);
        const g = ctx.createLinearGradient(0, r * rowH, 0, r * rowH + rowH);
        g.addColorStop(0, 'rgba(255,255,255,0.07)');
        g.addColorStop(1, 'rgba(0,0,0,0.18)');
        ctx.fillStyle = g;
        ctx.fillRect(x + 3, r * rowH + 3, bw - 6, rowH - 6);
        // musgo y humedad ocasional
        if (Math.random() < 0.12) {
          ctx.fillStyle = `rgba(70, 90, 40, ${rand(0.08, 0.2)})`;
          ctx.beginPath();
          ctx.ellipse(x + bw / 2, r * rowH + rowH - 8, bw * 0.4, 10, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        x += bw;
      }
    }
    speckle(ctx, w, h, 5000, 0.12);
  });
}

function planksCanvas() {
  return makeCanvas(512, 512, (ctx, w, h) => {
    const n = 8;
    const pw = w / n;
    for (let i = 0; i < n; i++) {
      let y = -rand(0, 300);
      while (y < h) {
        const len = rand(220, 420);
        ctx.fillStyle = `hsl(${rand(22, 30)}, ${rand(30, 42)}%, ${rand(11, 17)}%)`;
        ctx.fillRect(i * pw + 1, y, pw - 2, len - 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        for (let g = 0; g < 7; g++) {
          const gx = i * pw + rand(4, pw - 4);
          ctx.beginPath();
          ctx.moveTo(gx, y);
          for (let s = 0; s <= len; s += 20) ctx.lineTo(gx + Math.sin(s * 0.03 + g) * 2.5, y + s);
          ctx.stroke();
        }
        y += len;
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    for (let i = 0; i <= n; i++) ctx.fillRect(i * pw - 1, 0, 2, h);
    speckle(ctx, w, h, 2500, 0.08);
  });
}

function woodCanvas() {
  return makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#3a2414';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '120,80,40'},${rand(0.1, 0.3)})`;
      ctx.lineWidth = rand(1, 3);
      const y0 = rand(0, h);
      ctx.beginPath();
      ctx.moveTo(0, y0);
      for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y0 + Math.sin(x * 0.02 + i) * 4);
      ctx.stroke();
    }
  });
}

function coilCanvas() {
  return makeCanvas(64, 256, (ctx, w, h) => {
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? '#b86b2e' : '#5a2e10';
      ctx.fillRect(0, y, w, 4);
    }
  });
}

function rainCanvas() {
  return makeCanvas(128, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(200,220,255,0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 70; i++) {
      const x = rand(0, w);
      const y = rand(0, h);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + rand(10, 22));
      ctx.stroke();
    }
  });
}

function drawSky(ctx, w, h, flash) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, flash ? '#8fa3d6' : '#0b1020');
  g.addColorStop(1, flash ? '#3b4a73' : '#03050b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    const x = rand(0, w);
    const y = rand(0, h * 0.75);
    const r = rand(30, 90);
    const cg = ctx.createRadialGradient(x, y, 0, x, y, r);
    cg.addColorStop(0, flash ? 'rgba(210,220,255,0.35)' : 'rgba(40,48,70,0.4)');
    cg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Silueta de tejados y una torre a lo lejos.
  ctx.fillStyle = '#010203';
  ctx.beginPath();
  ctx.moveTo(0, h);
  let x = 0;
  while (x < w) {
    const top = h - rand(20, 60);
    ctx.lineTo(x, top);
    ctx.lineTo(x + 12, top - 14);
    ctx.lineTo(x + 24, top);
    x += rand(28, 46);
  }
  ctx.lineTo(w, h);
  ctx.fill();
  ctx.fillRect(w * 0.7, h - 150, 22, 150);
  ctx.beginPath();
  ctx.moveTo(w * 0.7 - 4, h - 150);
  ctx.lineTo(w * 0.7 + 11, h - 200);
  ctx.lineTo(w * 0.7 + 26, h - 150);
  ctx.fill();

  if (flash) {
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#c7d2fe';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 3;
    let bx = rand(w * 0.2, w * 0.8);
    let by = 0;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    while (by < h * 0.8) {
      bx += rand(-25, 25);
      by += rand(12, 30);
      ctx.lineTo(bx, by);
      if (Math.random() < 0.18) {
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + rand(-50, 50), by + rand(20, 50));
        ctx.moveTo(bx, by);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function chalkboardCanvas() {
  return makeCanvas(1024, 640, (ctx, w, h) => {
    ctx.fillStyle = '#17231c';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255,255,255,${rand(0.01, 0.035)})`;
      ctx.beginPath();
      ctx.ellipse(rand(0, w), rand(0, h), rand(60, 200), rand(15, 50), rand(0, 3), 0, Math.PI * 2);
      ctx.fill();
    }
    const chalk = 'rgba(236, 236, 225, 0.88)';
    ctx.fillStyle = chalk;
    ctx.strokeStyle = chalk;
    ctx.lineCap = 'round';
    ctx.font = 'italic 44px Georgia, serif';
    ctx.fillText('Ingolstadt, noviembre de 1797', 40, 70);
    ctx.font = 'italic 30px Georgia, serif';
    ctx.fillText('Galvani (1780): ancas de rana + chispa = movimiento', 40, 130);
    ctx.fillText('Botella de Leyden:   Q = C · V', 40, 180);
    ctx.fillText('¿Chispa vital?  →  ¿vida?', 40, 230);

    // Figura humana con puntos de electrodo
    const cx = 790;
    const cy = 330;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy - 150, 38, 0, Math.PI * 2);
    ctx.moveTo(cx, cy - 112);
    ctx.lineTo(cx, cy + 60);
    ctx.moveTo(cx - 90, cy - 70);
    ctx.lineTo(cx, cy - 90);
    ctx.lineTo(cx + 90, cy - 70);
    ctx.moveTo(cx, cy + 60);
    ctx.lineTo(cx - 55, cy + 200);
    ctx.moveTo(cx, cy + 60);
    ctx.lineTo(cx + 55, cy + 200);
    ctx.stroke();
    ctx.font = 'bold 40px Georgia, serif';
    [['+', cx - 14, cy - 185], ['−', cx - 74, cy + 225], ['−', cx + 46, cy + 225]].forEach(([s, x, y]) => ctx.fillText(s, x, y));
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(cx + 40, cy - 160);
    ctx.quadraticCurveTo(cx + 170, cy - 60, cx + 70, cy + 200);
    ctx.stroke();
    ctx.setLineDash([]);

    // Botella de Leyden
    const lx = 140;
    const ly = 300;
    ctx.lineWidth = 3;
    ctx.strokeRect(lx, ly + 40, 110, 170);
    ctx.beginPath();
    ctx.moveTo(lx + 55, ly + 40);
    ctx.lineTo(lx + 55, ly - 20);
    ctx.arc(lx + 55, ly - 34, 14, Math.PI / 2, Math.PI * 2.5);
    ctx.stroke();
    ctx.fillStyle = 'rgba(236,236,225,0.25)';
    ctx.fillRect(lx, ly + 120, 110, 90);
    ctx.fillStyle = chalk;
    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillText('lámina metálica', lx + 125, ly + 170);
    ctx.fillText('vidrio (dieléctrico)', lx + 125, ly + 80);

    ctx.font = 'italic 34px Georgia, serif';
    ctx.fillText('«Es la vida misma lo que busco»', 300, 590);
  });
}

/* -------------------------------- rayos ------------------------------ */

const BOLT_CORE = new THREE.MeshBasicMaterial({ color: '#f5f8ff', toneMapped: false });
const BOLT_GLOW = new THREE.MeshBasicMaterial({
  color: '#7c9cff', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
});

class Bolt {
  constructor(parent) {
    this.core = new THREE.Mesh(new THREE.BufferGeometry(), BOLT_CORE);
    this.glow = new THREE.Mesh(new THREE.BufferGeometry(), BOLT_GLOW);
    this.core.visible = false;
    this.glow.visible = false;
    parent.add(this.core, this.glow);
    this.timer = 0;
  }

  set visible(v) {
    this.core.visible = v;
    this.glow.visible = v;
  }

  get visible() {
    return this.core.visible;
  }

  strike(a, b) {
    const dist = a.distanceTo(b);
    const segs = Math.max(6, Math.round(dist * 9));
    const pts = [];
    const jitter = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const p = a.clone().lerp(b, t);
      if (i > 0 && i < segs) {
        jitter.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(dist * 0.09 * Math.sin(Math.PI * t) + 0.02);
        p.add(jitter);
      }
      pts.push(p);
    }
    const path = new THREE.CurvePath();
    for (let i = 0; i < segs; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    this.core.geometry.dispose();
    this.glow.geometry.dispose();
    this.core.geometry = new THREE.TubeGeometry(path, segs * 2, 0.006, 4, false);
    this.glow.geometry = new THREE.TubeGeometry(path, segs * 2, 0.03, 5, false);
    this.visible = true;
  }
}

/* -------------------------------- sonido ----------------------------- */

class LabAudio {
  start() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(ctx.destination);

    const noise = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = noise.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = noise;
    const brownBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const bd = brownBuf.getChannelData(0);
    for (let i = 0; i < bd.length; i++) {
      brown = (brown + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      bd[i] = brown * 3.5;
    }

    // Lluvia
    const rain = ctx.createBufferSource();
    rain.buffer = noise;
    rain.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 500;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3500;
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.09;
    rain.connect(hp).connect(lp).connect(rainGain).connect(this.master);
    rain.start();

    // Rumor de fondo
    const rumble = ctx.createBufferSource();
    rumble.buffer = brownBuf;
    rumble.loop = true;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.25;
    rumble.connect(rumbleGain).connect(this.master);
    rumble.start();

    // Zumbido eléctrico (sube con la carga)
    const o1 = ctx.createOscillator();
    o1.type = 'sawtooth';
    o1.frequency.value = 55;
    const o2 = ctx.createOscillator();
    o2.type = 'square';
    o2.frequency.value = 110.6;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 330;
    bp.Q.value = 0.8;
    this.hum = ctx.createGain();
    this.hum.gain.value = 0.015;
    const o2g = ctx.createGain();
    o2g.gain.value = 0.3;
    o1.connect(bp);
    o2.connect(o2g).connect(bp);
    bp.connect(this.hum).connect(this.master);
    o1.start();
    o2.start();
    this.humFilter = bp;
  }

  get ready() {
    return this.ctx && this.ctx.state === 'running';
  }

  setCharge(level) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.hum.gain.setTargetAtTime(0.015 + level * 0.16, t, 0.1);
    this.humFilter.frequency.setTargetAtTime(330 + level * 900, t, 0.2);
  }

  burst({ when = 0, dur = 0.08, gain = 0.2, hp = 1800, lp = 12000, decay = dur }) {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = rand(0.8, 1.2);
    const h = ctx.createBiquadFilter();
    h.type = 'highpass';
    h.frequency.value = hp;
    const l = ctx.createBiquadFilter();
    l.type = 'lowpass';
    l.frequency.value = lp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    src.connect(h).connect(l).connect(g).connect(this.master);
    src.start(t, rand(0, 2));
    src.stop(t + dur + 0.05);
  }

  crackle(strength = 1) {
    this.burst({ dur: 0.06, gain: 0.05 * strength, hp: 2500, decay: rand(0.03, 0.07) });
  }

  thunder(delay, power = 1) {
    if (!this.ready) return;
    this.burst({ when: delay, dur: 0.4, gain: 0.5 * power, hp: 200, lp: 4000, decay: 0.35 });
    this.burst({ when: delay + 0.05, dur: 4, gain: 0.9 * power, hp: 20, lp: 260, decay: 3.8 });
  }

  thump(when) {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.35);
  }
}

/* -------------------------- construcción de la sala ------------------ */

AFRAME.registerComponent('frankenstein-lab', {
  init() {
    this.audio = new LabAudio();
    this.flickers = [];
    this.bubbles = [];
    this.time = 0;
    this.nextLightning = 6;
    this.flash = 0;
    this.twitch = 0;
    this.lastSurgeIdx = -1;

    const startAudio = () => this.audio.start();
    this.el.addEventListener('enter-vr', () => {
      document.body.classList.add('xr-active');
      startAudio();
    });
    this.el.addEventListener('exit-vr', () => document.body.classList.remove('xr-active'));
    window.addEventListener('pointerdown', startAudio);
    window.addEventListener('keydown', startAudio);

    const build = () => {
      this.root = new THREE.Group();
      this.el.object3D.add(this.root);
      this.buildMaterials();
      this.buildRoom();
      this.buildWindow();
      this.buildTable();
      this.buildApparatus();
      this.buildCoils();
      this.buildBench();
      this.buildColorTable();
      this.buildShelves();
      this.buildPanel();
      this.buildDecor();
      this.buildLights();
      this.buildDust();
      this.el.object3D.fog = null;
      this.el.object3D.fog = new THREE.FogExp2('#040504', 0.085);
      this.ready = true;
    };
    if (this.el.hasLoaded) build();
    else this.el.addEventListener('loaded', build);
  },

  add(geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = this.root) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  },

  tube(points, radius, mat, parent = this.root) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 6, false), mat);
    parent.add(m);
    return m;
  },

  buildMaterials() {
    const stone = stoneCanvas();
    const planks = planksCanvas();
    const wood = woodCanvas();
    this.mat = {
      wall: new THREE.MeshStandardMaterial({
        map: canvasTexture(stone, 4, 2.1), bumpMap: canvasTexture(stone, 4, 2.1), bumpScale: 2.5, roughness: 0.95
      }),
      wallSide: new THREE.MeshStandardMaterial({
        map: canvasTexture(stone, 4.5, 2.1), bumpMap: canvasTexture(stone, 4.5, 2.1), bumpScale: 2.5, roughness: 0.95
      }),
      floor: new THREE.MeshStandardMaterial({ map: canvasTexture(planks, 4, 4.5), roughness: 0.8 }),
      ceiling: new THREE.MeshStandardMaterial({ map: canvasTexture(planks, 3, 3), color: '#6b5a48', roughness: 1 }),
      wood: new THREE.MeshStandardMaterial({ map: canvasTexture(wood), roughness: 0.75 }),
      darkWood: new THREE.MeshStandardMaterial({ map: canvasTexture(wood), color: '#6b5a50', roughness: 0.8 }),
      iron: new THREE.MeshStandardMaterial({ color: '#2b2d30', roughness: 0.55, metalness: 0.7 }),
      steel: new THREE.MeshStandardMaterial({ color: '#6b7178', roughness: 0.35, metalness: 0.6 }),
      brass: new THREE.MeshStandardMaterial({ color: '#b08d3c', roughness: 0.35, metalness: 0.75 }),
      copper: new THREE.MeshStandardMaterial({ color: '#b5653a', roughness: 0.35, metalness: 0.7 }),
      coil: new THREE.MeshStandardMaterial({ map: canvasTexture(coilCanvas(), 1, 6), roughness: 0.4, metalness: 0.6 }),
      rubber: new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9 }),
      sheet: new THREE.MeshStandardMaterial({ color: '#cfc8b8', roughness: 1 }),
      skin: new THREE.MeshStandardMaterial({ color: '#8e9a82', roughness: 0.85 }),
      stitch: new THREE.MeshStandardMaterial({ color: '#1c1a16', roughness: 1 }),
      glass: new THREE.MeshStandardMaterial({
        color: '#cfe8e0', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.22, depthWrite: false
      }),
      wax: new THREE.MeshStandardMaterial({ color: '#e8dcc0', roughness: 0.7 }),
      flame: new THREE.MeshBasicMaterial({ color: '#ffb347', toneMapped: false }),
      paper: new THREE.MeshStandardMaterial({ color: '#d8ccaa', roughness: 1 })
    };
  },

  liquid(color, intensity = 0.6) {
    return new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: intensity, transparent: true, opacity: 0.85, roughness: 0.2
    });
  },

  buildRoom() {
    const { x: X, zBack, zFront, h: H } = ROOM;
    const W = X * 2;
    const D = zFront - zBack;
    const m = this.mat;
    this.add(new THREE.PlaneGeometry(W, D), m.floor, 0, 0, (zBack + zFront) / 2, -Math.PI / 2);
    this.add(new THREE.PlaneGeometry(W, D), m.ceiling, 0, H, (zBack + zFront) / 2, Math.PI / 2);
    this.add(new THREE.PlaneGeometry(W, H), m.wall, 0, H / 2, zBack);
    // La salida deja un hueco real de 1,5 m para el pasillo.
    this.add(new THREE.PlaneGeometry((W - 1.5) / 2, H), m.wall, -(W + 1.5) / 4, H / 2, zFront, 0, Math.PI);
    this.add(new THREE.PlaneGeometry((W - 1.5) / 2, H), m.wall, (W + 1.5) / 4, H / 2, zFront, 0, Math.PI);
    this.add(new THREE.PlaneGeometry(1.5, H - 2.4), m.wall, 0, 2.4 + (H - 2.4) / 2, zFront, 0, Math.PI);
    this.add(new THREE.PlaneGeometry(D, H), m.wallSide, -X, H / 2, (zBack + zFront) / 2, 0, Math.PI / 2);
    this.add(new THREE.PlaneGeometry(D, H), m.wallSide, X, H / 2, (zBack + zFront) / 2, 0, -Math.PI / 2);

    // Vigas del techo
    const beam = new THREE.BoxGeometry(W, 0.22, 0.25);
    for (let z = zBack + 0.8; z < zFront; z += 1.6) this.add(beam, m.darkWood, 0, H - 0.11, z);
    const beamL = new THREE.BoxGeometry(0.25, 0.2, D);
    this.add(beamL, m.darkWood, -2, H - 0.3, (zBack + zFront) / 2);
    this.add(beamL, m.darkWood, 2, H - 0.3, (zBack + zFront) / 2);

    // Zócalo de piedra oscura
    const skirt = new THREE.MeshStandardMaterial({ color: '#141210', roughness: 1 });
    this.add(new THREE.BoxGeometry(W, 0.18, 0.08), skirt, 0, 0.09, zBack + 0.04);
    this.add(new THREE.BoxGeometry(0.08, 0.18, D), skirt, -X + 0.04, 0.09, (zBack + zFront) / 2);
    this.add(new THREE.BoxGeometry(0.08, 0.18, D), skirt, X - 0.04, 0.09, (zBack + zFront) / 2);

    // Alfombra raída bajo la mesa
    const rug = makeCanvas(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#3d1414';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#7a5a2a';
      ctx.lineWidth = 8;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.lineWidth = 3;
      ctx.strokeRect(34, 34, w - 68, h - 68);
      speckle(ctx, w, h, 3000, 0.2);
    });
    this.add(new THREE.PlaneGeometry(3.2, 2.2), new THREE.MeshStandardMaterial({ map: canvasTexture(rug), roughness: 1 }),
      0, 0.005, -1.8, -Math.PI / 2);
  },

  buildWindow() {
    const m = this.mat;
    const z = ROOM.zBack + 0.03;
    const w = 1.6;
    const h = 1.5;
    const y0 = 1.55;
    const r = w / 2;

    this.skyCanvas = makeCanvas(256, 360, (ctx, cw, ch) => drawSky(ctx, cw, ch, false));
    this.skyTex = canvasTexture(this.skyCanvas);
    this.skyMat = new THREE.MeshBasicMaterial({ map: this.skyTex, toneMapped: false });

    // Cielo: rectángulo + arco superior con UV continuas.
    const shape = new THREE.Shape();
    shape.moveTo(-r, 0);
    shape.lineTo(r, 0);
    shape.lineTo(r, h);
    shape.absarc(0, h, r, 0, Math.PI, false);
    shape.lineTo(-r, 0);
    const skyGeo = new THREE.ShapeGeometry(shape, 24);
    const uv = skyGeo.attributes.uv;
    const pos = skyGeo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + r) / w, pos.getY(i) / (h + r));
    this.add(skyGeo, this.skyMat, 0, y0, z);

    this.rainTex = canvasTexture(rainCanvas(), 2, 2);
    this.rainTex.colorSpace = THREE.SRGBColorSpace;
    const rainMat = new THREE.MeshBasicMaterial({ map: this.rainTex, transparent: true, depthWrite: false, toneMapped: false });
    this.add(skyGeo, rainMat, 0, y0, z + 0.01);

    // Marco y parteluces
    const fw = 0.07;
    this.add(new THREE.BoxGeometry(w + fw * 2, fw, 0.12), m.darkWood, 0, y0 - fw / 2, z + 0.04);
    this.add(new THREE.BoxGeometry(fw, h, 0.12), m.darkWood, -r - fw / 2, y0 + h / 2, z + 0.04);
    this.add(new THREE.BoxGeometry(fw, h, 0.12), m.darkWood, r + fw / 2, y0 + h / 2, z + 0.04);
    this.add(new THREE.TorusGeometry(r + fw / 2, fw / 2, 8, 32, Math.PI), m.darkWood, 0, y0 + h, z + 0.04);
    this.add(new THREE.BoxGeometry(0.035, h + r, 0.05), m.iron, 0, y0 + (h + r) / 2, z + 0.05);
    for (let k = 1; k <= 3; k++) this.add(new THREE.BoxGeometry(w, 0.025, 0.05), m.iron, 0, y0 + (k * h) / 3.2, z + 0.05);
    // Alféizar de piedra
    this.add(new THREE.BoxGeometry(w + 0.4, 0.1, 0.35), new THREE.MeshStandardMaterial({ color: '#3a352e', roughness: 1 }),
      0, y0 - 0.12, z + 0.15);
  },

  buildTable() {
    const m = this.mat;
    const g = new THREE.Group();
    g.position.set(0, 0, -1.8);
    this.root.add(g);
    this.table = g;

    // Mesa de piedra y hierro
    this.add(new THREE.BoxGeometry(2.2, 0.12, 0.9), m.steel, 0, 0.86, 0, 0, 0, 0, g);
    this.add(new THREE.BoxGeometry(2.0, 0.5, 0.7), m.iron, 0, 0.55, 0, 0, 0, 0, g);
    const leg = new THREE.BoxGeometry(0.14, 0.3, 0.14);
    [[-0.95, -0.33], [0.95, -0.33], [-0.95, 0.33], [0.95, 0.33]].forEach(([x, z]) => this.add(leg, m.iron, x, 0.15, z, 0, 0, 0, g));
    // Correas de cuero
    const strap = new THREE.MeshStandardMaterial({ color: '#3b2416', roughness: 0.9 });
    [-0.35, 0.25, 0.75].forEach((x) => this.add(new THREE.BoxGeometry(0.08, 0.02, 0.95), strap, x, 1.13, 0, 0, 0, 0, g));

    // Cuerpo bajo la sábana
    const s = m.sheet;
    this.add(new THREE.SphereGeometry(0.14, 20, 16), s, -0.85, 1.02, 0, 0, 0, 0, g).scale.set(1.15, 0.85, 1);
    this.add(new THREE.CapsuleGeometry(0.21, 0.5, 8, 16), s, -0.38, 0.99, 0, 0, 0, Math.PI / 2, g).scale.set(0.62, 1, 1);
    this.add(new THREE.CapsuleGeometry(0.09, 0.75, 6, 12), s, 0.35, 0.97, 0.1, 0, 0, Math.PI / 2, g).scale.set(0.75, 1, 1);
    this.add(new THREE.CapsuleGeometry(0.09, 0.75, 6, 12), s, 0.35, 0.97, -0.1, 0, 0, Math.PI / 2, g).scale.set(0.75, 1, 1);
    this.add(new THREE.BoxGeometry(0.1, 0.16, 0.12), s, 0.85, 1.02, 0.1, 0, 0, 0, g);
    this.add(new THREE.BoxGeometry(0.1, 0.16, 0.12), s, 0.85, 1.02, -0.1, 0, 0, 0, g);
    // Sábana que cae por los lados
    this.add(new THREE.BoxGeometry(2.0, 0.02, 0.8), s, 0.02, 0.93, 0, 0, 0, 0, g);
    const drape = new THREE.PlaneGeometry(1.9, 0.32, 1, 1);
    this.add(drape, s, 0.02, 0.78, 0.415, 0.08, 0, 0, g);
    this.add(drape, s, 0.02, 0.78, -0.415, -0.08, Math.PI, 0, g);

    // Brazo que asoma por debajo de la sábana, con costuras.
    const arm = new THREE.Group();
    arm.position.set(-0.42, 0.93, 0.42);
    g.add(arm);
    this.add(new THREE.CylinderGeometry(0.045, 0.04, 0.42, 12), m.skin, 0, -0.2, 0.03, 0.15, 0, 0, arm);
    const hand = new THREE.Group();
    hand.position.set(0, -0.42, 0.06);
    arm.add(hand);
    this.hand = hand;
    this.add(new THREE.BoxGeometry(0.085, 0.1, 0.035), m.skin, 0, -0.04, 0, 0, 0, 0, hand);
    this.fingers = [];
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Group();
      f.position.set(-0.03 + i * 0.02, -0.09, 0);
      hand.add(f);
      this.add(new THREE.CylinderGeometry(0.009, 0.008, 0.07 - Math.abs(i - 1.5) * 0.008, 6), m.skin, 0, -0.035, 0, 0, 0, 0, f);
      f.rotation.x = 0.35;
      this.fingers.push(f);
    }
    this.add(new THREE.CylinderGeometry(0.01, 0.009, 0.05, 6), m.skin, 0.05, -0.05, 0.01, 0, 0, 0.6, hand);
    // Costuras en la muñeca y el antebrazo
    for (let i = 0; i < 5; i++) {
      this.add(new THREE.BoxGeometry(0.005, 0.03, 0.098), m.stitch, -0.02 + i * 0.01, -0.36, 0.05, 0, 0, 0.3, arm);
    }
    this.add(new THREE.TorusGeometry(0.043, 0.003, 4, 20), m.stitch, 0, -0.38, 0.05, Math.PI / 2, 0, 0, arm);

    // Electrodos junto a la cabeza y los pies
    const rod = new THREE.CylinderGeometry(0.015, 0.015, 1.2, 8);
    const ball = new THREE.SphereGeometry(0.05, 16, 12);
    this.electrodes = [];
    [[-1.25, -0.25], [-1.25, 0.25], [1.25, 0]].forEach(([x, z]) => {
      this.add(new THREE.CylinderGeometry(0.12, 0.14, 0.06, 16), m.iron, x, 0.03, z, 0, 0, 0, g);
      this.add(rod, m.brass, x, 0.6, z, 0, 0, 0, g);
      this.add(ball, m.copper, x, 1.22, z, 0, 0, 0, g);
      this.electrodes.push(new THREE.Vector3(x, 1.22, z - 1.8));
    });
    // Cables de los electrodos al cuerpo
    this.tube([[-1.25, 1.18, -0.25 - 1.8], [-1.1, 1.0, -0.15 - 1.8], [-0.95, 1.05, -0.05 - 1.8]], 0.008, m.rubber);
    this.tube([[-1.25, 1.18, 0.25 - 1.8], [-1.1, 1.0, 0.15 - 1.8], [-0.95, 1.05, 0.05 - 1.8]], 0.008, m.rubber);
    this.tube([[1.25, 1.18, -1.8], [1.05, 1.0, -1.8], [0.9, 1.06, -1.85]], 0.008, m.rubber);
  },

  buildApparatus() {
    const m = this.mat;
    const g = new THREE.Group();
    g.position.set(0, 3.05, -1.8);
    this.root.add(g);
    this.apparatus = g;
    this.add(new THREE.TorusGeometry(0.75, 0.05, 12, 64), m.brass, 0, 0, 0, Math.PI / 2, 0, 0, g);
    this.add(new THREE.TorusGeometry(0.5, 0.025, 8, 48), m.copper, 0, -0.08, 0, Math.PI / 2, 0, 0, g);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      this.add(new THREE.CylinderGeometry(0.012, 0.012, 0.75, 6), m.iron, Math.cos(a) * 0.37, 0, Math.sin(a) * 0.37, 0, -a, Math.PI / 2, g);
    }
    this.coreMat = new THREE.MeshStandardMaterial({ color: '#9fd3ff', emissive: '#5aa8ff', emissiveIntensity: 0.8, roughness: 0.2 });
    this.core = this.add(new THREE.SphereGeometry(0.13, 24, 18), this.coreMat, 0, -0.05, 0, 0, 0, 0, g);
    this.add(new THREE.SphereGeometry(0.2, 24, 18), m.glass, 0, -0.05, 0, 0, 0, 0, g);
    this.add(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12), m.iron, 0, 0.18, 0, 0, 0, 0, g);

    // Cadenas hasta el techo
    const link = new THREE.TorusGeometry(0.03, 0.008, 6, 12);
    for (let c = 0; c < 4; c++) {
      const a = (c / 4) * Math.PI * 2 + Math.PI / 4;
      const x = Math.cos(a) * 0.75;
      const z = Math.sin(a) * 0.75;
      for (let y = 0.04; y < ROOM.h - 3.05; y += 0.05) {
        this.add(link, m.iron, x, y, z, 0, (y * 20) % 2 < 1 ? 0 : Math.PI / 2, Math.PI / 2, g);
      }
    }
    // Cables colgantes del aparato a los electrodos
    this.tube([[-0.6, 2.95, -1.8], [-1.0, 2.2, -1.9], [-1.25, 1.6, -2.05], [-1.25, 1.27, -2.05]], 0.012, m.rubber);
    this.tube([[0.6, 2.95, -1.8], [1.1, 2.1, -1.7], [1.25, 1.27, -1.8]], 0.012, m.rubber);
    this.apparatusPoints = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      this.apparatusPoints.push(new THREE.Vector3(Math.cos(a) * 0.75, 3.05, -1.8 + Math.sin(a) * 0.75));
    }
  },

  buildCoils() {
    const m = this.mat;
    this.coilTops = [];
    [-2.35, 2.35].forEach((x) => {
      const z = -2.7;
      this.add(new THREE.BoxGeometry(0.6, 0.3, 0.6), m.darkWood, x, 0.15, z);
      this.add(new THREE.CylinderGeometry(0.26, 0.3, 0.12, 24), m.iron, x, 0.36, z);
      this.add(new THREE.CylinderGeometry(0.16, 0.16, 1.4, 32, 1, true), m.coil, x, 1.12, z);
      this.add(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 12), m.darkWood, x, 1.12, z);
      // Bobina primaria
      for (let k = 0; k < 4; k++) this.add(new THREE.TorusGeometry(0.3, 0.012, 6, 32), m.copper, x, 0.48 + k * 0.05, z, Math.PI / 2);
      this.add(new THREE.TorusGeometry(0.26, 0.09, 16, 40), m.steel, x, 1.92, z, Math.PI / 2);
      this.add(new THREE.SphereGeometry(0.1, 16, 12), m.steel, x, 1.95, z);
      this.coilTops.push(new THREE.Vector3(x, 1.95, z));
      // Cable por el suelo hasta el panel
      this.tube([[x, 0.05, z + 0.3], [x * 0.9, 0.02, z - 0.6], [x > 0 ? 2.6 : 0.5, 0.02, -4.2], [2.6, 0.2, -4.55]], 0.02, m.rubber);
    });
    this.bolts = [];
    for (let i = 0; i < 6; i++) this.bolts.push(new Bolt(this.root));
  },

  buildBench() {
    const m = this.mat;
    const g = new THREE.Group();
    g.position.set(-3.45, 0, -1.6);
    this.root.add(g);
    // Mesa de trabajo
    this.add(new THREE.BoxGeometry(0.85, 0.07, 2.8), m.wood, 0, 0.9, 0, 0, 0, 0, g);
    const leg = new THREE.BoxGeometry(0.08, 0.87, 0.08);
    [[-0.36, -1.3], [0.36, -1.3], [-0.36, 1.3], [0.36, 1.3]].forEach(([x, z]) => this.add(leg, m.wood, x, 0.435, z, 0, 0, 0, g));
    this.add(new THREE.BoxGeometry(0.75, 0.04, 2.6), m.wood, 0, 0.25, 0, 0, 0, 0, g);

    const glass = m.glass;
    const bubbleGeo = new THREE.SphereGeometry(0.007, 6, 4);
    const addBubbles = (x, y, z, r, hgt, color) => {
      const bm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, toneMapped: false });
      for (let i = 0; i < 6; i++) {
        const b = this.add(bubbleGeo, bm, x, y, z, 0, 0, 0, g);
        this.bubbles.push({ mesh: b, x, y0: y, z, r, h: hgt, t: Math.random(), speed: rand(0.3, 0.7) });
      }
    };

    // Matraz Erlenmeyer verde (brillante)
    this.add(new THREE.CylinderGeometry(0.03, 0.11, 0.2, 20), glass, 0.1, 1.04, -1.0, 0, 0, 0, g);
    this.add(new THREE.CylinderGeometry(0.028, 0.028, 0.08, 12), glass, 0.1, 1.18, -1.0, 0, 0, 0, g);
    this.add(new THREE.CylinderGeometry(0.06, 0.1, 0.11, 20), this.liquid('#7cff4f', 0.9), 0.1, 0.995, -1.0, 0, 0, 0, g);
    addBubbles(0.1, 0.95, -1.0, 0.05, 0.12, '#d9ffb0');

    // Matraz redondo rojo sobre trípode y vela
    this.add(new THREE.SphereGeometry(0.1, 20, 16), glass, 0.05, 1.2, -0.55, 0, 0, 0, g);
    this.add(new THREE.CylinderGeometry(0.022, 0.022, 0.2, 12), glass, 0.05, 1.38, -0.55, 0, 0, 0, g);
    this.add(new THREE.SphereGeometry(0.085, 20, 16, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), this.liquid('#ff3b5c', 0.7), 0.05, 1.2, -0.55, 0, 0, 0, g);
    addBubbles(0.05, 1.13, -0.55, 0.05, 0.08, '#ffc2cc');
    this.add(new THREE.TorusGeometry(0.09, 0.006, 6, 24), m.iron, 0.05, 1.1, -0.55, Math.PI / 2, 0, 0, g);
    [0, 2.1, 4.2].forEach((a) => this.add(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 4), m.iron,
      0.05 + Math.cos(a) * 0.09, 1.0, -0.55 + Math.sin(a) * 0.09, 0, 0, 0, g));
    this.candle(g, 0.05, 0.94, -0.55, 0.06);
    // Tubo de destilación hacia un vaso
    this.tube([[0.05, 1.48, -1.15 + 0.6], [0.05, 1.5, -0.3 + 0.0], [0.05, 1.25, -0.05], [0.05, 1.05, 0.05]].map(([x, y, z]) => [x - 3.45, y, z - 1.6]), 0.008, glass);
    this.add(new THREE.CylinderGeometry(0.06, 0.055, 0.14, 20), glass, 0.05, 1.0, 0.05, 0, 0, 0, g);
    this.add(new THREE.CylinderGeometry(0.052, 0.05, 0.05, 20), this.liquid('#ffd34d', 0.6), 0.05, 0.96, 0.05, 0, 0, 0, g);

    // Cerebro en un frasco
    const brainGeo = new THREE.IcosahedronGeometry(0.09, 4);
    const p = brainGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = 1 + 0.08 * Math.sin(v.x * 90) * Math.sin(v.y * 70) * Math.sin(v.z * 80) - (Math.abs(v.x) < 0.008 ? 0.12 : 0);
      v.multiplyScalar(n);
      v.y *= 0.8;
      v.z *= 1.2;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    brainGeo.computeVertexNormals();
    this.add(brainGeo, new THREE.MeshStandardMaterial({ color: '#d9909a', roughness: 0.6 }), 0.05, 1.08, 0.65, 0, Math.PI / 2, 0, g);
    this.add(new THREE.CylinderGeometry(0.14, 0.14, 0.32, 24, 1, true), glass, 0.05, 1.1, 0.65, 0, 0, 0, g);
    this.add(new THREE.CylinderGeometry(0.135, 0.135, 0.27, 24), new THREE.MeshStandardMaterial({
      color: '#9be37a', emissive: '#3c6b2a', emissiveIntensity: 0.4, transparent: true, opacity: 0.3, depthWrite: false
    }), 0.05, 1.075, 0.65, 0, 0, 0, g);
    this.add(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 24), m.brass, 0.05, 1.27, 0.65, 0, 0, 0, g);
    addBubbles(0.05, 0.96, 0.65, 0.1, 0.25, '#e4ffd6');

    // Gradilla de tubos de ensayo
    this.add(new THREE.BoxGeometry(0.1, 0.02, 0.36), m.wood, 0.18, 1.02, 0.15, 0, 0, 0, g);
    ['#46e0ff', '#c084fc', '#7cff4f', '#ff8a3d', '#ffe14d'].forEach((c, i) => {
      const z = 0.0 + i * 0.07;
      this.add(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 10), glass, 0.18, 1.06, z, 0, 0, 0, g);
      this.add(new THREE.CylinderGeometry(0.012, 0.012, rand(0.05, 0.11), 10), this.liquid(c, 0.8), 0.18, 1.02, z, 0, 0, 0, g);
    });

    // Libros y papeles
    const bookColors = ['#4a1c1c', '#1f3a2a', '#3b2c1a', '#22263d', '#5a3a1a'];
    let y = 0.935;
    for (let i = 0; i < 4; i++) {
      const hgt = rand(0.04, 0.07);
      this.add(new THREE.BoxGeometry(0.28, hgt, 0.2), new THREE.MeshStandardMaterial({ color: pick(bookColors), roughness: 0.8 }),
        0.0, y + hgt / 2, 1.1, 0, rand(-0.3, 0.3), 0, g);
      y += hgt;
    }
    this.candle(g, 0.0, y, 1.1, 0.1);
    const notes = makeCanvas(256, 340, (ctx, w, h) => {
      ctx.fillStyle = '#d6c9a4';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(40,25,10,0.7)';
      ctx.lineWidth = 1.5;
      for (let ly = 30; ly < h - 20; ly += 14) {
        ctx.beginPath();
        let lx = 18;
        ctx.moveTo(lx, ly);
        while (lx < w - 20) {
          lx += rand(4, 9);
          ctx.lineTo(lx, ly + rand(-2, 2));
        }
        ctx.stroke();
      }
      speckle(ctx, w, h, 600, 0.12);
    });
    const notesMat = new THREE.MeshStandardMaterial({ map: canvasTexture(notes), roughness: 1 });
    this.add(new THREE.PlaneGeometry(0.21, 0.28), notesMat, -0.1, 0.937, 0.25, -Math.PI / 2, 0, 0.3, g);
    this.add(new THREE.PlaneGeometry(0.21, 0.28), notesMat, -0.18, 0.936, -0.15, -Math.PI / 2, 0, -0.2, g);
    // Pluma y tintero
    this.add(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 16), new THREE.MeshStandardMaterial({ color: '#0d0d12', roughness: 0.2 }), -0.2, 0.96, 0.4, 0, 0, 0, g);
    this.add(new THREE.ConeGeometry(0.012, 0.22, 6), m.paper, -0.2, 1.06, 0.42, 0.4, 0, 0.2, g);
  },

  buildColorTable() {
    const m = this.mat;
    const g = new THREE.Group();
    g.position.set(-2.75, 0, 2.15);
    this.root.add(g);
    this.add(new THREE.BoxGeometry(1.55, 0.12, 0.8), m.wood, 0, 0.85, 0, 0, 0, 0, g);
    const leg = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    [-0.65, 0.65].forEach((x) => [-0.3, 0.3].forEach((z) => this.add(leg, m.darkWood, x, 0.4, z, 0, 0, 0, g)));
    this.add(new THREE.BoxGeometry(1.35, 0.06, 0.53), m.iron, 0, 0.95, 0, 0, 0, 0, g);
    this.colorButtons = [];
    [['rojo', '#ef4444'], ['azul', '#3b82f6'], ['verde', '#84cc16'], ['amarillo', '#facc15']].forEach(([name, color], i) => {
      const x = -0.48 + i * 0.32;
      this.add(new THREE.CylinderGeometry(0.13, 0.13, 0.055, 24), m.brass, x, 1.01, 0, 0, 0, 0, g);
      const cap = this.add(new THREE.CylinderGeometry(0.095, 0.095, 0.075, 24), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25, roughness: 0.35 }), x, 1.08, 0, 0, 0, 0, g);
      this.colorButtons.push({ name, mesh: cap });
    });
  },

  candle(parent, x, y, z, h = 0.1) {
    const m = this.mat;
    this.add(new THREE.CylinderGeometry(0.018, 0.02, h, 12), m.wax, x, y + h / 2, z, 0, 0, 0, parent);
    const flame = this.add(new THREE.SphereGeometry(0.012, 10, 8), m.flame, x, y + h + 0.02, z, 0, 0, 0, parent);
    flame.scale.set(1, 2, 1);
    this.flickers.push({ mesh: flame, phase: Math.random() * 10 });
    return flame;
  },

  buildShelves() {
    const m = this.mat;
    const g = new THREE.Group();
    g.position.set(3.75, 0, -2.0);
    this.root.add(g);
    const len = 2.6;
    [0.95, 1.55, 2.15].forEach((y) => {
      this.add(new THREE.BoxGeometry(0.4, 0.04, len), m.wood, 0, y, 0, 0, 0, 0, g);
      // ménsulas
      [-1.1, 0, 1.1].forEach((z) => this.add(new THREE.BoxGeometry(0.3, 0.12, 0.03), m.iron, 0.05, y - 0.08, z, 0, 0, 0, g));
    });
    const colors = ['#7cff4f', '#46e0ff', '#c084fc', '#ff8a3d', '#ff3b5c', '#ffe14d', '#9be37a', '#5eead4'];
    [0.95, 1.55, 2.15].forEach((y, row) => {
      let z = -len / 2 + 0.15;
      while (z < len / 2 - 0.15) {
        const kind = Math.random();
        if (kind < 0.55) {
          const r = rand(0.04, 0.08);
          const hgt = rand(0.12, 0.26);
          this.add(new THREE.CylinderGeometry(r, r, hgt, 16, 1, true), m.glass, -0.02, y + 0.02 + hgt / 2, z, 0, 0, 0, g);
          const fill = rand(0.4, 0.9);
          this.add(new THREE.CylinderGeometry(r * 0.92, r * 0.92, hgt * fill, 16), this.liquid(pick(colors), rand(0.15, 0.6)),
            -0.02, y + 0.02 + (hgt * fill) / 2, z, 0, 0, 0, g);
          this.add(new THREE.CylinderGeometry(r * 1.05, r * 1.05, 0.02, 16), row === 1 ? m.brass : m.darkWood, -0.02, y + 0.03 + hgt, z, 0, 0, 0, g);
          z += r * 2 + rand(0.04, 0.1);
        } else if (kind < 0.85) {
          const n = Math.floor(rand(3, 7));
          for (let b = 0; b < n; b++) {
            const hgt = rand(0.18, 0.26);
            this.add(new THREE.BoxGeometry(0.2, hgt, 0.045), new THREE.MeshStandardMaterial({ color: `hsl(${rand(0, 40)}, ${rand(20, 50)}%, ${rand(10, 22)}%)`, roughness: 0.85 }),
              0, y + 0.02 + hgt / 2, z, 0.0, 0, 0, g);
            z += 0.05;
          }
          z += 0.06;
        } else {
          // calavera estilizada
          this.add(new THREE.SphereGeometry(0.07, 16, 12), m.wax, 0, y + 0.1, z, 0, 0, 0, g).scale.set(1, 0.95, 1.15);
          this.add(new THREE.BoxGeometry(0.08, 0.04, 0.07), m.wax, 0, y + 0.045, z + 0.0, 0, 0, 0, g);
          const eye = new THREE.MeshBasicMaterial({ color: '#000000' });
          this.add(new THREE.SphereGeometry(0.017, 8, 6), eye, -0.055, y + 0.11, z - 0.025, 0, 0, 0, g);
          this.add(new THREE.SphereGeometry(0.017, 8, 6), eye, -0.055, y + 0.11, z + 0.025, 0, 0, 0, g);
          z += 0.22;
        }
      }
    });

    // Pizarra
    const board = this.add(new THREE.PlaneGeometry(2.0, 1.25), new THREE.MeshStandardMaterial({ map: canvasTexture(chalkboardCanvas()), roughness: 0.95 }),
      ROOM.x - 0.03, 1.75, 1.3, 0, -Math.PI / 2);
    board.renderOrder = 1;
    const frame = m.darkWood;
    this.add(new THREE.BoxGeometry(0.06, 0.07, 2.14), frame, ROOM.x - 0.04, 1.75 + 0.66, 1.3);
    this.add(new THREE.BoxGeometry(0.06, 0.07, 2.14), frame, ROOM.x - 0.04, 1.75 - 0.66, 1.3);
    this.add(new THREE.BoxGeometry(0.06, 1.25, 0.07), frame, ROOM.x - 0.04, 1.75, 1.3 - 1.04);
    this.add(new THREE.BoxGeometry(0.06, 1.25, 0.07), frame, ROOM.x - 0.04, 1.75, 1.3 + 1.04);
    this.add(new THREE.BoxGeometry(0.12, 0.03, 1.9), frame, ROOM.x - 0.08, 1.1, 1.3);
  },

  buildPanel() {
    const m = this.mat;
    const g = new THREE.Group();
    g.position.set(2.5, 0, -4.6);
    this.root.add(g);
    this.add(new THREE.BoxGeometry(1.6, 1.0, 0.6), m.darkWood, 0, 0.5, 0, 0, 0, 0, g);
    this.add(new THREE.BoxGeometry(1.6, 0.9, 0.1), m.wood, 0, 1.45, -0.25, 0, 0, 0, g);

    // Botellas de Leyden
    for (let i = 0; i < 4; i++) {
      const x = -0.6 + i * 0.22;
      this.add(new THREE.CylinderGeometry(0.075, 0.075, 0.26, 20, 1, true), m.glass, x, 1.13, 0.1, 0, 0, 0, g);
      this.add(new THREE.CylinderGeometry(0.077, 0.077, 0.13, 20, 1, true), m.brass, x, 1.065, 0.1, 0, 0, 0, g);
      this.add(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), m.brass, x, 1.3, 0.1, 0, 0, 0, g);
      this.add(new THREE.SphereGeometry(0.025, 12, 8), m.brass, x, 1.46, 0.1, 0, 0, 0, g);
    }
    // Barra que las une
    this.add(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 6), m.copper, -0.27, 1.46, 0.1, 0, 0, Math.PI / 2, g);

    // Esferas de medición (diales)
    const dialFace = makeCanvas(128, 128, (ctx, w) => {
      ctx.fillStyle = '#e9dfc4';
      ctx.beginPath();
      ctx.arc(64, 64, 62, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2a1e10';
      ctx.lineWidth = 2;
      for (let a = -2.4; a <= 2.4; a += 0.24) {
        ctx.beginPath();
        ctx.moveTo(64 + Math.sin(a) * 50, 64 - Math.cos(a) * 50);
        ctx.lineTo(64 + Math.sin(a) * 58, 64 - Math.cos(a) * 58);
        ctx.stroke();
      }
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(64, 64, 54, -Math.PI / 2 + 1.6, -Math.PI / 2 + 2.4);
      ctx.arc(64, 64, 46, -Math.PI / 2 + 2.4, -Math.PI / 2 + 1.6, true);
      ctx.fill();
      ctx.font = 'italic 16px Georgia';
      ctx.fillStyle = '#2a1e10';
      ctx.textAlign = 'center';
      ctx.fillText('VIS', w / 2, 96);
    });
    const faceMat = new THREE.MeshStandardMaterial({ map: canvasTexture(dialFace), roughness: 0.6 });
    this.needles = [];
    [-0.45, 0, 0.45].forEach((x) => {
      this.add(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 32), m.brass, x, 1.55, -0.18, Math.PI / 2, 0, 0, g);
      this.add(new THREE.CircleGeometry(0.11, 32), faceMat, x, 1.55, -0.155, 0, 0, 0, g);
      const pivot = new THREE.Group();
      pivot.position.set(x, 1.55, -0.15);
      g.add(pivot);
      this.add(new THREE.BoxGeometry(0.006, 0.09, 0.004), new THREE.MeshBasicMaterial({ color: '#111' }), 0, 0.04, 0, 0, 0, 0, pivot);
      this.needles.push({ pivot, phase: Math.random() * 10 });
    });

    // Interruptor de cuchilla
    this.add(new THREE.BoxGeometry(0.3, 0.04, 0.22), new THREE.MeshStandardMaterial({ color: '#2a2622', roughness: 0.9 }), 0.55, 1.02, 0.05, 0, 0, 0, g);
    const lever = new THREE.Group();
    lever.position.set(0.55, 1.05, 0.1);
    lever.rotation.x = -0.9;
    g.add(lever);
    this.add(new THREE.BoxGeometry(0.16, 0.3, 0.015), m.copper, 0, 0.15, 0, 0, 0, 0, lever);
    this.add(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 10), new THREE.MeshStandardMaterial({ color: '#1a0f08', roughness: 0.4 }), 0, 0.31, 0, 0, 0, Math.PI / 2, lever);
    this.lever = lever;

    // Bombillas/válvulas brillantes
    this.tubesMat = new THREE.MeshBasicMaterial({ color: '#ff9a3c', toneMapped: false });
    [-0.65, -0.55].forEach((x) => {
      this.add(new THREE.SphereGeometry(0.035, 12, 10), this.tubesMat, x, 1.85, -0.18, 0, 0, 0, g);
      this.add(new THREE.SphereGeometry(0.05, 12, 10), m.glass, x, 1.85, -0.18, 0, 0, 0, g);
    });
  },

  buildDecor() {
    const m = this.mat;
    // Puerta tras el usuario
    const z = ROOM.zFront - 0.05;
    this.door = new THREE.Group();
    this.root.add(this.door);
    this.add(new THREE.BoxGeometry(1.3, 2.4, 0.08), m.darkWood, 0, 1.2, z, 0, 0, 0, this.door);
    [0.5, 1.9].forEach((y) => this.add(new THREE.BoxGeometry(1.3, 0.08, 0.1), m.iron, 0, y, z - 0.01, 0, 0, 0, this.door));
    this.add(new THREE.TorusGeometry(0.07, 0.012, 8, 20), m.iron, 0.45, 1.1, z - 0.07, 0, 0, 0, this.door);
    this.add(new THREE.BoxGeometry(1.5, 0.15, 0.15), new THREE.MeshStandardMaterial({ color: '#2b2622', roughness: 1 }), 0, 2.47, z);
    const voidMat = new THREE.MeshBasicMaterial({ color: '#030405', side: THREE.DoubleSide });
    this.add(new THREE.PlaneGeometry(1.5, 2.4), voidMat, 0, 1.2, z + 3, 0, Math.PI);
    const corridor = new THREE.MeshStandardMaterial({ color: '#111613', roughness: 1, side: THREE.DoubleSide });
    this.add(new THREE.PlaneGeometry(1.5, 3), corridor, 0, 0, z + 1.5, -Math.PI / 2);
    this.add(new THREE.PlaneGeometry(3, 2.4), corridor, -0.75, 1.2, z + 1.5, 0, Math.PI / 2);
    this.add(new THREE.PlaneGeometry(3, 2.4), corridor, 0.75, 1.2, z + 1.5, 0, -Math.PI / 2);
    this.add(new THREE.PlaneGeometry(1.5, 3), corridor, 0, 2.4, z + 1.5, Math.PI / 2);

    // Antorchas en las paredes laterales
    [[-ROOM.x + 0.12, 1.0], [ROOM.x - 0.12, -4.0], [-ROOM.x + 0.12, -4.2]].forEach(([x, tz]) => {
      this.add(new THREE.CylinderGeometry(0.03, 0.02, 0.35, 8), m.iron, x, 2.1, tz, 0, 0, x > 0 ? 0.35 : -0.35);
      this.add(new THREE.CylinderGeometry(0.06, 0.035, 0.08, 10), m.iron, x - Math.sign(x) * 0.06, 2.3, tz);
      const flame = this.add(new THREE.SphereGeometry(0.04, 10, 8), m.flame, x - Math.sign(x) * 0.06, 2.4, tz);
      flame.scale.set(1, 1.8, 1);
      this.flickers.push({ mesh: flame, phase: Math.random() * 10, big: true });
    });

    // Lámpara de araña con velas sobre la zona del usuario
    const ch = new THREE.Group();
    ch.position.set(0, 3.1, 0.9);
    this.root.add(ch);
    this.add(new THREE.TorusGeometry(0.45, 0.02, 8, 40), m.iron, 0, 0, 0, Math.PI / 2, 0, 0, ch);
    this.add(new THREE.CylinderGeometry(0.008, 0.008, ROOM.h - 3.1, 6), m.iron, 0, (ROOM.h - 3.1) / 2, 0, 0, 0, 0, ch);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      this.add(new THREE.CylinderGeometry(0.004, 0.004, 0.55, 4), m.iron, Math.cos(a) * 0.22, 0.2, Math.sin(a) * 0.22, Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7, ch);
      this.candle(ch, Math.cos(a) * 0.45, 0.01, Math.sin(a) * 0.45, 0.12);
    }

    // Barriles y cajas en una esquina
    const barrelMat = m.darkWood;
    [[-3.3, -4.3], [-2.75, -4.45]].forEach(([x, bz]) => {
      this.add(new THREE.CylinderGeometry(0.28, 0.25, 0.8, 18), barrelMat, x, 0.4, bz);
      [0.15, 0.65].forEach((y) => this.add(new THREE.TorusGeometry(0.27, 0.012, 6, 24), m.iron, x, y, bz, Math.PI / 2));
    });
    this.add(new THREE.BoxGeometry(0.6, 0.45, 0.5), m.wood, -3.2, 0.225, 3.2, 0, 0.3, 0);
    this.add(new THREE.BoxGeometry(0.45, 0.35, 0.4), m.wood, -3.15, 0.625, 3.2, 0, -0.2, 0);

    // Cadenas y grilletes en la pared izquierda
    const link = new THREE.TorusGeometry(0.035, 0.009, 6, 12);
    [2.0, 2.5].forEach((cz) => {
      for (let i = 0; i < 14; i++) {
        this.add(link, m.iron, -ROOM.x + 0.06, 2.6 - i * 0.06, cz + Math.sin(i * 0.35) * 0.08, 0, i % 2 ? 0 : Math.PI / 2, Math.PI / 2);
      }
    });
  },

  buildLights() {
    this.root.add(new THREE.HemisphereLight('#4a5878', '#22160c', 0.22));

    this.warm = new THREE.PointLight('#ffae5c', 7, 10, 1.5);
    this.warm.position.set(0, 2.9, 0.9);
    this.root.add(this.warm);

    this.benchLight = new THREE.PointLight('#ffa040', 3, 4.5, 1.5);
    this.benchLight.position.set(-3.2, 1.3, -1.6);
    this.root.add(this.benchLight);

    this.teslaLight = new THREE.PointLight('#8fb0ff', 0, 8, 1.4);
    this.teslaLight.position.set(0, 2.3, -2.6);
    this.root.add(this.teslaLight);

    this.coreLight = new THREE.PointLight('#5aa8ff', 2, 6, 1.5);
    this.coreLight.position.set(0, 2.6, -1.8);
    this.root.add(this.coreLight);

    this.torchLight = new THREE.PointLight('#ff9a40', 2.5, 5, 1.5);
    this.torchLight.position.set(ROOM.x - 0.5, 2.3, -4.0);
    this.root.add(this.torchLight);

    this.flashLight = new THREE.DirectionalLight('#c7d2fe', 0);
    this.flashLight.position.set(0, 3, -6);
    this.flashLight.target.position.set(0, 0, 1);
    this.root.add(this.flashLight, this.flashLight.target);
  },

  buildDust() {
    const count = 400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = rand(-3.8, 3.8);
      pos[i * 3 + 1] = rand(0.2, 3.9);
      pos[i * 3 + 2] = rand(-4.8, 3.8);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dot = makeCanvas(32, 32, (ctx) => {
      const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255,235,200,1)');
      g.addColorStop(1, 'rgba(255,235,200,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 32, 32);
    });
    this.dust = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.018, map: canvasTexture(dot), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    this.root.add(this.dust);
  },

  /* ------------------------------ animación ---------------------------- */

  lightning(power = 1) {
    const ctx = this.skyCanvas.getContext('2d');
    drawSky(ctx, this.skyCanvas.width, this.skyCanvas.height, true);
    this.skyTex.needsUpdate = true;
    this.flash = power;
    this.skyDirty = true;
    this.audio.thunder(rand(0.3, 1.4), power);
  },

  tick(time, dtMs) {
    if (!this.ready) return;
    const dt = Math.min(dtMs || 16, 100) / 1000;
    this.time += dt;
    const t = this.time;

    // --- Ciclo de carga: calma → carga → descarga → latido ---
    const phase = t % CYCLE;
    const surgeIdx = Math.floor(t / CYCLE);
    let charge = 0;
    if (phase > 15 && phase < 20.5) charge = (phase - 15) / 5.5;
    else if (phase >= 20.5 && phase < 21.2) charge = 1;
    else if (phase >= 21.2) charge = Math.max(0, 1 - (phase - 21.2) * 1.2);
    if (phase >= 20.5 && this.lastSurgeIdx !== surgeIdx) {
      this.lastSurgeIdx = surgeIdx;
      this.lightning(1.3);
      this.twitch = 1;
      this.audio.thump(1.2);
      this.audio.thump(1.55);
      this.audio.thump(2.6);
      this.audio.thump(2.95);
    }
    this.audio.setCharge(charge);

    // Relámpagos sueltos durante la calma
    this.nextLightning -= dt;
    if (this.nextLightning <= 0) {
      this.nextLightning = rand(7, 14);
      if (charge === 0) this.lightning(rand(0.5, 0.9));
    }

    // --- Rayos de las bobinas ---
    const activity = 0.25 + charge * 0.75;
    let lit = 0;
    this.bolts.forEach((bolt, i) => {
      bolt.timer -= dt;
      if (bolt.timer <= 0) {
        bolt.timer = rand(0.04, 0.11);
        const active = i < 2 ? Math.random() < activity : Math.random() < charge * 0.9;
        if (active) {
          const from = this.coilTops[i % 2];
          let to;
          const r = Math.random();
          if (charge > 0.3 && r < 0.5) to = pick(this.apparatusPoints);
          else if (r < 0.7 && charge > 0.1) to = this.coilTops[(i + 1) % 2];
          else if (charge > 0.6 && r < 0.85) to = pick(this.electrodes);
          else to = from.clone().add(new THREE.Vector3(rand(-0.7, 0.7), rand(-0.1, 0.7), rand(-0.7, 0.7)));
          bolt.strike(from, to);
          if (Math.random() < 0.6) this.audio.crackle(0.5 + charge);
        } else bolt.visible = false;
      }
      if (bolt.visible) lit++;
    });
    this.teslaLight.intensity = lit * rand(1.5, 3);

    // --- Aparato y núcleo ---
    const pulse = 0.5 + 0.5 * Math.sin(t * (2 + charge * 14));
    this.coreMat.emissiveIntensity = 0.6 + charge * 3 + pulse * 0.4;
    this.coreLight.intensity = 2 + charge * 8 + pulse * 1.5;
    this.apparatus.rotation.y += dt * (0.05 + charge * 1.5);
    this.lever.rotation.x = THREE.MathUtils.lerp(this.lever.rotation.x, charge > 0.9 ? 0.5 : -0.9, 1 - Math.exp(-6 * dt));
    this.tubesMat.color.setHSL(0.07, 1, 0.35 + charge * 0.3 + Math.random() * 0.05);
    this.needles.forEach((n) => {
      n.pivot.rotation.z = -2.2 + charge * 3.6 + Math.sin(t * 7 + n.phase) * 0.06 + Math.random() * charge * 0.15;
    });

    // --- Relámpago exterior ---
    if (this.flash > 0) {
      const f = this.flash * (Math.random() < 0.3 ? 0.4 : 1);
      this.flashLight.intensity = f * 5;
      this.flash = Math.max(0, this.flash - dt * 3.5);
      if (this.flash === 0 && this.skyDirty) {
        drawSky(this.skyCanvas.getContext('2d'), this.skyCanvas.width, this.skyCanvas.height, false);
        this.skyTex.needsUpdate = true;
        this.skyDirty = false;
        this.flashLight.intensity = 0;
      }
    }
    this.rainTex.offset.y += dt * 1.6;
    this.rainTex.offset.x += dt * 0.15;

    // --- Velas y antorchas ---
    let flick = 0;
    this.flickers.forEach((fl) => {
      const n = Math.sin(t * 11 + fl.phase) * 0.5 + Math.sin(t * 23 + fl.phase * 2) * 0.3 + Math.random() * 0.2;
      fl.mesh.scale.y = (fl.big ? 1.8 : 2) * (1 + n * 0.15);
      flick += n;
    });
    flick /= this.flickers.length;
    this.warm.intensity = 6.5 + flick * 1.4;
    this.benchLight.intensity = 3 + flick * 0.9;
    this.torchLight.intensity = 2.5 + flick * 1.2;

    // --- Burbujas ---
    this.bubbles.forEach((b) => {
      b.t += dt * b.speed;
      if (b.t > 1) {
        b.t = 0;
        b.ox = rand(-b.r, b.r) * 0.7;
        b.oz = rand(-b.r, b.r) * 0.7;
      }
      b.mesh.position.set(b.x + (b.ox || 0), b.y0 + b.t * b.h, b.z + (b.oz || 0));
      b.mesh.scale.setScalar(0.5 + b.t);
    });

    // --- Polvo en suspensión ---
    this.dust.rotation.y = Math.sin(t * 0.05) * 0.05;
    this.dust.position.y = Math.sin(t * 0.2) * 0.05;

    // --- La mano se estremece tras la descarga ---
    if (this.twitch > 0) {
      this.twitch = Math.max(0, this.twitch - dt * 0.35);
      const k = this.twitch * (Math.sin(t * 40) > 0.6 ? 1 : 0.3);
      this.hand.rotation.x = Math.sin(t * 30) * 0.12 * k;
      this.fingers.forEach((f, i) => {
        f.rotation.x = 0.35 + Math.max(0, Math.sin(t * 9 + i)) * 0.9 * this.twitch;
      });
    }
  }
});

/* ---------------------- desplazamiento con joystick ------------------ */

AFRAME.registerComponent('thumb-locomotion', {
  init() {
    this.move = new THREE.Vector2();
    this.turnReady = true;
    this.rig = null;
    const bind = () => {
      this.rig = document.getElementById('rig');
      this.cam = document.getElementById('cam');
      document.getElementById('leftHand').addEventListener('thumbstickmoved', (e) => this.move.set(e.detail.x, e.detail.y));
      document.getElementById('rightHand').addEventListener('thumbstickmoved', (e) => this.snapTurn(e.detail.x));
    };
    if (this.el.hasLoaded) bind();
    else this.el.addEventListener('loaded', bind);
  },

  snapTurn(x) {
    if (Math.abs(x) < 0.3) {
      this.turnReady = true;
      return;
    }
    if (!this.turnReady || Math.abs(x) < 0.75) return;
    this.turnReady = false;
    // Gira el rig alrededor de la posición de la cabeza.
    const rig = this.rig.object3D;
    const head = new THREE.Vector3();
    this.cam.object3D.getWorldPosition(head);
    const angle = x > 0 ? -Math.PI / 6 : Math.PI / 6;
    const offset = rig.position.clone().sub(head).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    rig.position.copy(head).add(offset);
    rig.position.y = 0;
    rig.rotation.y += angle;
  },

  tick(time, dtMs) {
    if (!this.rig || this.move.lengthSq() < 0.02) return;
    const dt = Math.min(dtMs || 16, 100) / 1000;
    const q = new THREE.Quaternion();
    this.cam.object3D.getWorldQuaternion(q);
    const yaw = new THREE.Euler().setFromQuaternion(q, 'YXZ').y;
    const dir = new THREE.Vector3(this.move.x, 0, this.move.y).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const rig = this.rig.object3D;
    rig.position.addScaledVector(dir, 1.6 * dt);
    rig.position.x = THREE.MathUtils.clamp(rig.position.x, -ROOM.x + 0.4, ROOM.x - 0.4);
    const escape = this.el.components['escape-room'];
    const exitLimit = escape && escape.open ? ROOM.zFront + 2.5 : ROOM.zFront - 0.4;
    rig.position.z = THREE.MathUtils.clamp(rig.position.z, ROOM.zBack + 0.5, exitLimit);
  }
});

/* ------------------------ comprobación de soporte -------------------- */

window.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('status');
  if (!window.isSecureContext) {
    status.textContent = 'Hace falta abrir esta página mediante HTTPS para usar WebXR.';
    status.className = 'status error';
    return;
  }
  if (!navigator.xr) {
    status.textContent = 'Sin WebXR: puedes explorar la sala en 2D. Para VR, ábrelo en Meta Quest Browser.';
    return;
  }
  try {
    const supported = await navigator.xr.isSessionSupported('immersive-vr');
    status.textContent = supported
      ? 'Visor listo: pulsa «Entrar al laboratorio».'
      : 'Este navegador no ofrece VR: puedes explorar la sala en 2D.';
    if (!supported) status.className = 'status error';
  } catch (error) {
    status.textContent = 'No se pudo comprobar el modo VR. Prueba a entrar igualmente.';
  }
});
