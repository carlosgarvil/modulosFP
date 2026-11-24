/* global AFRAME, THREE */

/* ------------------------------------------------------------------
 * Ordenación inmersiva
 * Un arco de barras rodea al usuario. Cada algoritmo es un generador
 * que produce operaciones (comparar, intercambiar, escribir…) y el
 * componente `sorting-lab` las reproduce como animación y sonido.
 * ------------------------------------------------------------------ */

const N = 32;                          // número de barras
const ARC = THREE.MathUtils.degToRad(110); // apertura del arco
const RADIUS = 1.9;                    // distancia al usuario (m)
const BASE_Y = 0.55;                   // altura de la base de las barras
const MIN_H = 0.06;
const MAX_H = 1.0;
const BAR_W = 0.08;
const SPEEDS = [1, 3, 8, 20, 60];      // pasos por segundo
const DATASETS = [
  { id: 'random', label: 'Aleatorio' },
  { id: 'reversed', label: 'Invertido' },
  { id: 'nearly', label: 'Casi ordenado' },
  { id: 'few', label: 'Pocos valores' }
];
const FONT = '"Segoe UI", Inter, system-ui, sans-serif';

/* ---------------------------- Algoritmos --------------------------- */

function* swp(a, i, j) {
  [a[i], a[j]] = [a[j], a[i]];
  yield { t: 'swap', i, j };
}

function* bubble(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    yield { t: 'range', lo: 0, hi: n - 1 - i };
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      yield { t: 'cmp', i: j, j: j + 1 };
      if (a[j] > a[j + 1]) {
        yield* swp(a, j, j + 1);
        swapped = true;
      }
    }
    yield { t: 'sorted', i: n - 1 - i };
    if (!swapped) break;
  }
}

function* selection(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    yield { t: 'range', lo: i, hi: n - 1 };
    let m = i;
    yield { t: 'pivot', i: m };
    for (let j = i + 1; j < n; j++) {
      yield { t: 'cmp', i: j, j: m };
      if (a[j] < a[m]) {
        m = j;
        yield { t: 'pivot', i: m };
      }
    }
    if (m !== i) yield* swp(a, i, m);
    yield { t: 'sorted', i };
  }
  yield { t: 'pivot', i: null };
}

function* insertion(a) {
  for (let i = 1; i < a.length; i++) {
    yield { t: 'range', lo: 0, hi: i };
    yield { t: 'pivot', i };
    let j = i;
    while (j > 0) {
      yield { t: 'cmp', i: j - 1, j };
      if (a[j - 1] > a[j]) {
        yield* swp(a, j - 1, j);
        j--;
      } else break;
    }
  }
  yield { t: 'pivot', i: null };
}

function* quickPart(a, lo, hi) {
  if (lo > hi) return;
  if (lo === hi) {
    yield { t: 'sorted', i: lo };
    return;
  }
  yield { t: 'range', lo, hi };
  yield { t: 'pivot', i: hi };
  let i = lo;
  for (let j = lo; j < hi; j++) {
    yield { t: 'cmp', i: j, j: hi };
    if (a[j] < a[hi]) {
      if (i !== j) yield* swp(a, i, j);
      i++;
    }
  }
  if (i !== hi) yield* swp(a, i, hi);
  yield { t: 'pivot', i: null };
  yield { t: 'sorted', i };
  yield* quickPart(a, lo, i - 1);
  yield* quickPart(a, i + 1, hi);
}

function* quick(a) {
  yield* quickPart(a, 0, a.length - 1);
}

function* mergePart(a, lo, hi) {
  if (lo >= hi) return;
  const mid = (lo + hi) >> 1;
  yield* mergePart(a, lo, mid);
  yield* mergePart(a, mid + 1, hi);
  yield { t: 'range', lo, hi };
  const L = a.slice(lo, mid + 1);
  const R = a.slice(mid + 1, hi + 1);
  let i = 0;
  let j = 0;
  let k = lo;
  while (i < L.length && j < R.length) {
    yield { t: 'cmp', i: k, j: mid + 1 + j };
    const v = L[i] <= R[j] ? L[i++] : R[j++];
    a[k] = v;
    yield { t: 'set', i: k, v };
    k++;
  }
  while (i < L.length) {
    a[k] = L[i++];
    yield { t: 'set', i: k, v: a[k] };
    k++;
  }
  // Lo que queda de la mitad derecha ya está en su sitio.
}

function* merge(a) {
  yield* mergePart(a, 0, a.length - 1);
}

function* siftDown(a, i, n) {
  yield { t: 'pivot', i };
  for (;;) {
    const l = 2 * i + 1;
    const r = l + 1;
    let m = i;
    if (l < n) {
      yield { t: 'cmp', i: l, j: m };
      if (a[l] > a[m]) m = l;
    }
    if (r < n) {
      yield { t: 'cmp', i: r, j: m };
      if (a[r] > a[m]) m = r;
    }
    if (m === i) break;
    yield* swp(a, i, m);
    i = m;
  }
  yield { t: 'pivot', i: null };
}

function* heap(a) {
  const n = a.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) yield* siftDown(a, i, n);
  for (let end = n - 1; end > 0; end--) {
    yield { t: 'range', lo: 0, hi: end };
    yield* swp(a, 0, end);
    yield { t: 'sorted', i: end };
    yield* siftDown(a, 0, end);
  }
  yield { t: 'sorted', i: 0 };
}

const ALGORITHMS = [
  {
    name: 'Burbuja',
    complexity: 'O(n²)',
    description: 'Compara cada barra con su vecina y las intercambia si están al revés. En cada pasada la mayor “sube” hasta el final.',
    gen: bubble
  },
  {
    name: 'Selección',
    complexity: 'O(n²)',
    description: 'Busca el mínimo del tramo sin ordenar (marcado en magenta) y lo lleva al principio. Hace pocos intercambios y muchas comparaciones.',
    gen: selection
  },
  {
    name: 'Inserción',
    complexity: 'O(n²) · O(n) casi ordenado',
    description: 'Toma cada barra (magenta) y la desplaza hacia la izquierda hasta su sitio. Vuela con datos casi ordenados.',
    gen: insertion
  },
  {
    name: 'Quicksort',
    complexity: 'O(n log n) medio · O(n²) peor',
    description: 'Elige un pivote (magenta) y deja los menores a su izquierda y los mayores a su derecha. Repite en cada lado: lo atenuado queda fuera del tramo actual.',
    gen: quick
  },
  {
    name: 'Mergesort',
    complexity: 'O(n log n) siempre',
    description: 'Divide la lista en mitades, ordena cada una y las mezcla escribiendo los valores en orden. Observa cómo los tramos crecen: 2, 4, 8, 16…',
    gen: merge
  },
  {
    name: 'Heapsort',
    complexity: 'O(n log n)',
    description: 'Organiza las barras como un montículo (un árbol binario guardado en el array) y extrae el máximo una y otra vez hacia el final.',
    gen: heap
  }
];

function makeData(kind) {
  const values = Array.from({ length: N }, (_, i) => i + 1);
  const rnd = (n) => Math.floor(Math.random() * n);
  if (kind === 'random') {
    for (let i = N - 1; i > 0; i--) {
      const j = rnd(i + 1);
      [values[i], values[j]] = [values[j], values[i]];
    }
  } else if (kind === 'reversed') {
    values.reverse();
  } else if (kind === 'nearly') {
    for (let s = 0; s < 4; s++) {
      const i = rnd(N - 3);
      const j = i + 1 + rnd(3);
      [values[i], values[j]] = [values[j], values[i]];
    }
  } else if (kind === 'few') {
    for (let i = 0; i < N; i++) values[i] = (1 + rnd(4)) * (N / 4);
  }
  return values;
}

/* --------------------------- Utilidades 2D ------------------------- */

function canvasPlane(w, h, pxPerMeter) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * pxPerMeter);
  canvas.height = Math.round(h * pxPerMeter);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  return { canvas, ctx: canvas.getContext('2d'), tex, mesh };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

/* ---------------------------- Componente --------------------------- */

const WHITE = new THREE.Color('#ffffff');
const YELLOW = new THREE.Color('#facc15');
const MAGENTA = new THREE.Color('#e879f9');

AFRAME.registerComponent('sorting-lab', {
  init() {
    this.algoIdx = 3;
    this.speedIdx = 2;
    this.datasetIdx = 0;
    this.sound = true;
    this.playing = false;
    this.done = false;
    this.acc = 0;
    this.boardDirty = true;
    this.boardClock = 0;
    this.time = 0;
    this.tmpColor = new THREE.Color();
    this.tmpEmissive = new THREE.Color();

    const build = () => {
      this.lab = document.getElementById('lab');
      this.buildBars();
      this.buildBoard();
      this.buildPanel();
      this.bindInputs();
      this.newData();
      this.ready = true;
    };
    if (this.el.hasLoaded) build();
    else this.el.addEventListener('loaded', build);

    this.el.addEventListener('enter-vr', () => {
      document.body.classList.add('xr-active');
      this.ensureAudio();
    });
    this.el.addEventListener('exit-vr', () => document.body.classList.remove('xr-active'));
  },

  /* ---------- construcción de la escena ---------- */

  angleFor(slot) {
    return -ARC / 2 + (ARC * (slot + 0.5)) / N;
  },

  heightFor(value) {
    return MIN_H + (value / N) * (MAX_H - MIN_H);
  },

  buildBars() {
    const group = new THREE.Group();
    this.lab.object3D.add(group);

    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    this.bars = [];
    for (let k = 0; k < N; k++) {
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      const ang = this.angleFor(k);
      this.bars.push({
        mesh, slot: k, value: k + 1,
        ang, targetAng: ang, h: 0.01, targetH: 0.01,
        flashType: null, flash: 0, sorted: false, wave: 0, waveDelay: -1
      });
    }
    this.slots = this.bars.slice();

    // Arco luminoso que hace de base.
    const margin = 0.05;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(RADIUS - 0.09, RADIUS + 0.09, 96, 1, Math.PI / 2 - ARC / 2 - margin, ARC + 2 * margin),
      new THREE.MeshBasicMaterial({ color: '#a78bfa', transparent: true, opacity: 0.28, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = BASE_Y - 0.004;
    group.add(ring);

    // Marcador del pivote: un cono que señala hacia abajo.
    this.marker = new THREE.Mesh(
      new THREE.ConeGeometry(0.035, 0.08, 20),
      new THREE.MeshStandardMaterial({ color: '#e879f9', emissive: '#c026d3', emissiveIntensity: 0.8 })
    );
    this.marker.rotation.x = Math.PI;
    this.marker.visible = false;
    group.add(this.marker);
  },

  buildBoard() {
    this.board = canvasPlane(1.5, 0.5, 800);
    this.board.mesh.scale.setScalar(1.15);
    this.board.mesh.position.set(0, 2.0, -2.1);
    this.board.mesh.rotation.x = 0.15;
    this.lab.object3D.add(this.board.mesh);
  },

  buildPanel() {
    const panel = document.createElement('a-entity');
    panel.setAttribute('position', '0 1.0 -0.62');
    panel.setAttribute('rotation', '-35 0 0');
    this.lab.appendChild(panel);

    const bgW = 0.685;
    const bgH = 0.42;
    const bg = canvasPlane(bgW, bgH, 1400);
    const { ctx, canvas } = bg;
    roundRect(ctx, 3, 3, canvas.width - 6, canvas.height - 6, 60);
    ctx.fillStyle = 'rgba(13, 10, 31, 0.84)';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.45)';
    ctx.stroke();
    ctx.fillStyle = '#c4b5fd';
    ctx.font = `800 34px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('PANEL DE CONTROL', canvas.width / 2, 40);
    bg.tex.needsUpdate = true;
    panel.setObject3D('mesh', bg.mesh);

    const bw = 0.205;
    const bh = 0.072;
    const gx = 0.015;
    const gy = 0.014;
    const rowY = (r) => bgH / 2 - 0.055 - bh / 2 - r * (bh + gy);
    const colX = (c) => (c - 1) * (bw + gx);

    this.buttons = [];
    const add = (row, col, label, onClick, isActive) => {
      const surface = canvasPlane(bw, bh, 1750);
      const el = document.createElement('a-entity');
      el.classList.add('clickable');
      el.setAttribute('position', { x: colX(col), y: rowY(row), z: 0.004 });
      el.setObject3D('mesh', surface.mesh);
      panel.appendChild(el);
      const btn = { el, surface, label, isActive, hover: false };
      el.addEventListener('click', () => {
        this.ensureAudio();
        this.blip();
        onClick();
        this.refreshUI();
      });
      el.addEventListener('mouseenter', () => { btn.hover = true; this.drawButton(btn); });
      el.addEventListener('mouseleave', () => { btn.hover = false; this.drawButton(btn); });
      this.buttons.push(btn);
    };

    ALGORITHMS.forEach((algo, i) => {
      add(Math.floor(i / 3), i % 3, () => algo.name, () => this.selectAlgo(i), () => this.algoIdx === i);
    });
    add(2, 0, () => (this.playing ? '❚❚  Pausa' : this.done ? '↺  Repetir' : '▶  Reproducir'), () => this.togglePlay(), () => this.playing);
    add(2, 1, () => 'Paso  ▸', () => this.stepOnce());
    add(2, 2, () => 'Mezclar', () => this.newData());
    add(3, 0, () => `Vel.: ${SPEEDS[this.speedIdx]}/s`, () => { this.speedIdx = (this.speedIdx + 1) % SPEEDS.length; });
    add(3, 1, () => DATASETS[this.datasetIdx].label, () => {
      this.datasetIdx = (this.datasetIdx + 1) % DATASETS.length;
      this.newData();
    });
    add(3, 2, () => (this.sound ? 'Sonido: sí' : 'Sonido: no'), () => { this.sound = !this.sound; });

    this.buttons.forEach((b) => this.drawButton(b));
  },

  drawButton(btn) {
    const { ctx, canvas, tex } = btn.surface;
    const active = btn.isActive ? btn.isActive() : false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    roundRect(ctx, 3, 3, canvas.width - 6, canvas.height - 6, 26);
    if (active) {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#f472b6');
      grad.addColorStop(0.5, '#a78bfa');
      grad.addColorStop(1, '#60a5fa');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = btn.hover ? '#3b3170' : '#1e1940';
    }
    ctx.fill();
    ctx.lineWidth = btn.hover ? 6 : 3;
    ctx.strokeStyle = btn.hover ? '#ffffff' : 'rgba(196, 181, 253, 0.5)';
    ctx.stroke();
    ctx.fillStyle = active ? '#12082b' : '#f5f3ff';
    ctx.font = `800 40px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label(), canvas.width / 2, canvas.height / 2 + 2);
    tex.needsUpdate = true;
  },

  refreshUI() {
    this.buttons.forEach((b) => this.drawButton(b));
    this.boardDirty = true;
  },

  drawBoard() {
    const { ctx, canvas, tex } = this.board;
    const W = canvas.width;
    const H = canvas.height;
    const algo = ALGORITHMS[this.algoIdx];
    ctx.clearRect(0, 0, W, H);
    roundRect(ctx, 3, 3, W - 6, H - 6, 40);
    ctx.fillStyle = 'rgba(13, 10, 31, 0.8)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.4)';
    ctx.stroke();

    const pad = 44;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#ffffff';
    ctx.font = `900 64px ${FONT}`;
    ctx.fillText(algo.name, pad, 92);
    const nameW = ctx.measureText(algo.name).width;

    ctx.font = `800 28px ${FONT}`;
    const tag = algo.complexity;
    const tagW = ctx.measureText(tag).width + 32;
    roundRect(ctx, pad + nameW + 24, 52, tagW, 48, 24);
    ctx.fillStyle = 'rgba(167, 139, 250, 0.25)';
    ctx.fill();
    ctx.fillStyle = '#ddd6fe';
    ctx.fillText(tag, pad + nameW + 40, 86);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `500 29px ${FONT}`;
    wrapLines(ctx, algo.description, W - pad * 2).slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, pad, 145 + i * 38);
    });

    const stats = [
      ['Comparaciones', this.comparisons],
      ['Intercambios', this.swaps],
      ['Escrituras', this.writes]
    ];
    stats.forEach(([label, value], i) => {
      const x = pad + i * 250;
      ctx.fillStyle = '#94a3b8';
      ctx.font = `700 22px ${FONT}`;
      ctx.fillText(label.toUpperCase(), x, 288);
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 52px ${FONT}`;
      ctx.fillText(String(value), x, 340);
    });

    let status;
    let statusColor = '#c4b5fd';
    if (this.done) {
      status = '✔ ¡Ordenado!';
      statusColor = '#86efac';
    } else if (this.playing) status = `▶ En marcha · ${SPEEDS[this.speedIdx]} pasos/s`;
    else if (this.comparisons + this.swaps + this.writes === 0) status = 'Pulsa ▶ o A / X';
    else status = '❚❚ En pausa';
    ctx.textAlign = 'right';
    ctx.fillStyle = statusColor;
    ctx.font = `800 34px ${FONT}`;
    ctx.fillText(status, W - pad, 300);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `600 24px ${FONT}`;
    ctx.fillText(`Datos: ${DATASETS[this.datasetIdx].label} · ${N} barras`, W - pad, 340);

    // Leyenda
    const legend = [['#ffffff', 'Comparando'], ['#facc15', 'Intercambio / escritura'], ['#e879f9', 'Pivote / mínimo'], ['#334155', 'Fuera del tramo']];
    ctx.textAlign = 'left';
    ctx.font = `600 22px ${FONT}`;
    let lx = pad;
    legend.forEach(([color, text]) => {
      roundRect(ctx, lx, 368, 22, 22, 5);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(text, lx + 32, 387);
      lx += 32 + ctx.measureText(text).width + 36;
    });

    tex.needsUpdate = true;
  },

  bindInputs() {
    ['leftHand', 'rightHand'].forEach((id) => {
      const hand = document.getElementById(id);
      ['abuttondown', 'xbuttondown'].forEach((ev) => hand.addEventListener(ev, () => { this.togglePlay(); this.refreshUI(); }));
      ['bbuttondown', 'ybuttondown'].forEach((ev) => hand.addEventListener(ev, () => { this.stepOnce(); this.refreshUI(); }));
      hand.addEventListener('gripdown', () => this.recenter());
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { e.preventDefault(); this.ensureAudio(); this.togglePlay(); }
      else if (e.code === 'ArrowRight') { this.ensureAudio(); this.stepOnce(); }
      else if (e.code === 'KeyR') this.newData();
      else return;
      this.refreshUI();
    });
  },

  recenter() {
    const cam = document.getElementById('cam').object3D;
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    cam.getWorldPosition(pos);
    cam.getWorldQuaternion(quat);
    const yaw = new THREE.Euler().setFromQuaternion(quat, 'YXZ').y;
    this.lab.object3D.position.set(pos.x, 0, pos.z);
    this.lab.object3D.rotation.set(0, yaw, 0);
  },

  /* ---------- estado y control ---------- */

  newData() {
    this.initial = makeData(DATASETS[this.datasetIdx].id);
    this.reset();
  },

  reset() {
    this.slots.forEach((bar, k) => {
      bar.value = this.initial[k];
      bar.targetH = this.heightFor(bar.value);
      bar.sorted = false;
      bar.flash = 0;
      bar.wave = 0;
      bar.waveDelay = -1;
    });
    this.gen = ALGORITHMS[this.algoIdx].gen(this.initial.slice());
    this.comparisons = 0;
    this.swaps = 0;
    this.writes = 0;
    this.range = null;
    this.pivotBar = null;
    this.done = false;
    this.playing = false;
    this.acc = 0;
    this.refreshUI();
  },

  selectAlgo(i) {
    this.algoIdx = i;
    this.reset(); // mismo desorden: así se pueden comparar algoritmos
  },

  togglePlay() {
    if (this.done) {
      this.reset();
      this.playing = true;
    } else {
      this.playing = !this.playing;
    }
  },

  stepOnce() {
    if (this.done) this.reset();
    this.playing = false;
    this.step();
  },

  step() {
    if (this.done) return false;
    for (let guard = 0; guard < 10000; guard++) {
      const r = this.gen.next();
      if (r.done) {
        this.finish();
        return false;
      }
      if (this.apply(r.value)) {
        this.boardDirty = true;
        return true;
      }
    }
    return false;
  },

  flashBar(bar, type) {
    bar.flashType = type;
    bar.flash = 1;
  },

  apply(op) {
    switch (op.t) {
      case 'cmp': {
        this.comparisons++;
        const a = this.slots[op.i];
        const b = this.slots[op.j];
        this.flashBar(a, 'cmp');
        this.flashBar(b, 'cmp');
        this.tone(a.value);
        return true;
      }
      case 'swap': {
        this.swaps++;
        const a = this.slots[op.i];
        const b = this.slots[op.j];
        this.slots[op.i] = b;
        this.slots[op.j] = a;
        a.slot = op.j;
        b.slot = op.i;
        a.targetAng = this.angleFor(op.j);
        b.targetAng = this.angleFor(op.i);
        this.flashBar(a, 'swap');
        this.flashBar(b, 'swap');
        this.tone(b.value);
        return true;
      }
      case 'set': {
        this.writes++;
        const bar = this.slots[op.i];
        bar.value = op.v;
        bar.targetH = this.heightFor(op.v);
        this.flashBar(bar, 'swap');
        this.tone(op.v);
        return true;
      }
      case 'sorted':
        this.slots[op.i].sorted = true;
        return false;
      case 'range':
        this.range = { lo: op.lo, hi: op.hi };
        return false;
      case 'pivot':
        this.pivotBar = op.i === null ? null : this.slots[op.i];
        return false;
      default:
        return false;
    }
  },

  finish() {
    this.done = true;
    this.playing = false;
    this.range = null;
    this.pivotBar = null;
    this.celebrateT = 0;
    this.slots.forEach((bar, k) => {
      bar.sorted = true;
      bar.waveDelay = k * 0.045;
      if (this.sound) this.tone(bar.value, 0.14, k * 0.045, true);
    });
    this.refreshUI();
  },

  /* ---------- sonido ---------- */

  ensureAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!this.audio) {
      this.audio = new AC();
      this.master = this.audio.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.audio.destination);
    }
    if (this.audio.state === 'suspended') this.audio.resume();
  },

  tone(value, dur = 0.07, when = 0, force = false) {
    if (!this.sound || !this.audio || this.audio.state !== 'running') return;
    if (!force) {
      if (this.toneBudget <= 0) return;
      this.toneBudget--;
    }
    const ac = this.audio;
    const t = ac.currentTime + when;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 180 + (value / N) * 900;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },

  blip() {
    if (!this.sound || !this.audio || this.audio.state !== 'running') return;
    const ac = this.audio;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.05);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.08);
  },

  /* ---------- bucle ---------- */

  tick(time, dtMs) {
    if (!this.ready) return;
    const dt = Math.min(dtMs || 16, 100) / 1000;
    this.time += dt;
    this.toneBudget = 1;
    const speed = SPEEDS[this.speedIdx];

    if (this.playing) {
      this.acc += dt * speed;
      let n = 0;
      while (this.acc >= 1 && n < 8) {
        this.acc -= 1;
        n++;
        if (!this.step()) break;
      }
      if (this.acc > 4) this.acc = 0;
    }

    if (this.done) this.celebrateT += dt;

    const moveK = 1 - Math.exp(-(12 + speed * 0.6) * dt);
    const growK = 1 - Math.exp(-12 * dt);
    const flashDecay = dt / Math.max(0.09, 0.9 / speed);
    const c = this.tmpColor;
    const e = this.tmpEmissive;

    this.bars.forEach((bar) => {
      bar.ang += (bar.targetAng - bar.ang) * moveK;
      bar.h += (bar.targetH - bar.h) * growK;
      bar.flash = Math.max(0, bar.flash - flashDecay);

      // Al moverse, las barras saltan y se apartan del arco para no atravesarse.
      const d = bar.targetAng - bar.ang;
      const lift = Math.min(0.14, Math.abs(d) * 0.7);
      const radial = RADIUS - Math.sign(d) * Math.min(0.14, Math.abs(d) * 0.9);

      if (bar.waveDelay >= 0 && this.done) {
        const local = this.celebrateT - bar.waveDelay;
        bar.wave = local > 0 ? Math.max(0, 1 - local / 0.6) * Math.min(1, local / 0.08) : 0;
      }

      const m = bar.mesh;
      m.position.set(radial * Math.sin(bar.ang), BASE_Y + lift + bar.wave * 0.07, -radial * Math.cos(bar.ang));
      m.rotation.y = -bar.ang;
      m.scale.set(BAR_W, Math.max(0.005, bar.h), BAR_W);

      // Color: arcoíris según el valor; ordenadas, forman un degradado perfecto.
      c.setHSL(((bar.value - 1) / (N - 1)) * 0.75, 0.8, 0.56, THREE.SRGBColorSpace);
      e.setRGB(0, 0, 0);
      const outOfRange = this.range && (bar.slot < this.range.lo || bar.slot > this.range.hi);
      if (outOfRange && !bar.sorted) c.multiplyScalar(0.3);
      else if (outOfRange) c.multiplyScalar(0.55);
      if (bar.sorted) e.copy(c).multiplyScalar(0.25);
      if (bar === this.pivotBar) {
        c.lerp(MAGENTA, 0.6);
        e.copy(MAGENTA).multiplyScalar(0.35);
      }
      if (bar.flash > 0) {
        const target = bar.flashType === 'cmp' ? WHITE : YELLOW;
        c.lerp(target, 0.8 * bar.flash);
        e.lerp(target, 0.45 * bar.flash);
      }
      if (bar.wave > 0) e.lerp(WHITE, 0.6 * bar.wave);
      m.material.color.copy(c);
      m.material.emissive.copy(e);
    });

    if (this.pivotBar) {
      const p = this.pivotBar.mesh.position;
      this.marker.visible = true;
      this.marker.position.set(p.x, p.y + this.pivotBar.h + 0.09 + Math.sin(this.time * 6) * 0.015, p.z);
    } else {
      this.marker.visible = false;
    }

    this.boardClock += dt;
    if (this.boardDirty && this.boardClock > 0.1) {
      this.boardClock = 0;
      this.boardDirty = false;
      this.drawBoard();
    }
  }
});

/* -------------------- Comprobación de compatibilidad ---------------- */

window.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('status');

  if (!window.isSecureContext) {
    status.textContent = 'Hace falta abrir esta página mediante HTTPS para usar WebXR.';
    status.className = 'status error';
    return;
  }

  if (!navigator.xr) {
    status.textContent = 'Este navegador no ofrece WebXR. Ábrelo en Meta Quest Browser.';
    status.className = 'status error';
    return;
  }

  try {
    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    status.textContent = supported
      ? 'Quest lista: el modo de realidad mixta está disponible.'
      : 'El navegador tiene WebXR, pero no ofrece el modo AR con passthrough.';
    status.className = supported ? 'status ok' : 'status error';
  } catch (error) {
    status.textContent = 'No se pudo comprobar el modo AR. Prueba a entrar igualmente.';
    status.className = 'status error';
  }
});
