/* global AFRAME, THREE */

// Una fase por página: la sala siguiente se carga solo al atravesar la salida.
AFRAME.registerComponent('escape-room', {
  init() {
    this.clues = [
      { title: 'Cuaderno del doctor', detail: 'Secuencia de activación: 1. ROJO.', point: [-3.15, 1.15, -0.9] },
      { title: 'Archivo de la criatura', detail: 'Secuencia de activación: 2. AZUL.', point: [3.3, 1.65, -2.1] },
      { title: 'Panel de control', detail: 'Secuencia de activación: 3. VERDE.', point: [2.5, 1.55, -4.3] },
      { title: 'Mesa de operaciones', detail: 'Secuencia de activación: 4. AMARILLO.', point: [0, 1.15, -1.8] }
    ];
    this.open = false;
    this.sequence = ['rojo', 'azul', 'verde', 'amarillo'];
    this.input = [];
    this.transitioning = false;
    this.head = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.tmpQuaternion = new THREE.Quaternion();
    this.messageUntil = 0;
    this.lastPrompt = '';

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    this.ctx = canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, depthTest: false, toneMapped: false });
    this.hud = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.2375), material);
    this.hud.position.set(0, -0.31, -1.15);
    this.hud.renderOrder = 100;
    document.getElementById('cam').object3D.add(this.hud);

    this.onAction = () => this.inspect();
    this.onKey = (event) => { if (event.code === 'KeyE') this.inspect(); };
    this.onClick = () => { if (!this.el.is('vr-mode')) this.inspect(); };
    document.getElementById('rightHand').addEventListener('triggerdown', this.onAction);
    document.getElementById('leftHand').addEventListener('triggerdown', this.onAction);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('click', this.onClick);

    const build = () => {
      const lab = this.el.components['frankenstein-lab'];
      if (!lab || !lab.ready) return;
      this.lab = lab;
      const markerMat = new THREE.MeshBasicMaterial({ color: '#d9f99d', transparent: true, opacity: 0.85, toneMapped: false });
      this.clues.forEach((clue) => {
        clue.unlocked = false;
        clue.marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.11), markerMat.clone());
        clue.marker.position.set(...clue.point);
        clue.marker.visible = false;
        lab.root.add(clue.marker);
      });
      this.renderPrompt('Explora la sala. Acércate a las cuatro pistas.');
    };
    if (this.el.hasLoaded) build();
    else this.el.addEventListener('loaded', build, { once: true });
  },

  renderPrompt(message) {
    if (message === this.lastPrompt) return;
    this.lastPrompt = message;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 1024, 256);
    if (!message) { this.texture.needsUpdate = true; return; }
    ctx.fillStyle = 'rgba(5, 12, 8, 0.88)';
    ctx.fillRect(0, 12, 1024, 220);
    ctx.strokeStyle = '#b4d47d';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 14, 1020, 216);
    ctx.fillStyle = '#e8f5d7';
    ctx.font = 'bold 32px sans-serif';
    const words = message.split(' ');
    let line = '';
    let y = 92;
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > 930 && line) {
        ctx.fillText(line, 38, y);
        line = word;
        y += 47;
      } else line = next;
    }
    ctx.fillText(line, 38, y);
    this.texture.needsUpdate = true;
  },

  nearestClue() {
    const camera = document.getElementById('cam').object3D;
    camera.getWorldPosition(this.head);
    camera.getWorldQuaternion(this.tmpQuaternion);
    this.forward.set(0, 0, -1).applyQuaternion(this.tmpQuaternion);
    let selected = null;
    let best = Infinity;
    for (const clue of this.clues) {
      if (clue.unlocked) continue;
      clue.marker.getWorldPosition(this.target);
      const distance = this.head.distanceTo(this.target);
      clue.marker.visible = distance < 1.4;
      if (distance > 1.25) continue;
      const facing = this.target.clone().sub(this.head).normalize().dot(this.forward);
      if (facing > 0.7 && distance < best) { selected = clue; best = distance; }
    }
    return selected;
  },

  inspect() {
    if (!this.lab || this.open) return;
    const clue = this.nearestClue();
    if (!clue) {
      const button = this.nearestButton();
      if (button) this.pressButton(button);
      return;
    }
    clue.unlocked = true;
    clue.marker.visible = false;
    const count = this.clues.filter((item) => item.unlocked).length;
    this.messageUntil = performance.now() + 6500;
    this.renderPrompt(`${clue.title}: ${clue.detail} (${count}/4)`);
    if (count === this.clues.length) this.renderPrompt('Ya conoces las cuatro pistas. Pulsa los colores en orden en la mesa izquierda.');
  },

  nearestButton() {
    const camera = document.getElementById('cam').object3D;
    camera.getWorldPosition(this.head);
    camera.getWorldQuaternion(this.tmpQuaternion);
    this.forward.set(0, 0, -1).applyQuaternion(this.tmpQuaternion);
    let selected = null;
    let best = Infinity;
    for (const button of this.lab.colorButtons) {
      button.mesh.getWorldPosition(this.target);
      const distance = this.head.distanceTo(this.target);
      if (distance > 1.65) continue;
      const facing = this.target.clone().sub(this.head).normalize().dot(this.forward);
      if (facing > 0.9 && distance < best) { selected = button; best = distance; }
    }
    return selected;
  },

  pressButton(button) {
    const count = this.clues.filter((item) => item.unlocked).length;
    this.messageUntil = performance.now() + 3500;
    if (count < this.clues.length) {
      this.renderPrompt(`Necesitas investigar las cuatro pistas antes de activar la mesa. Pistas: ${count}/4`);
      return;
    }
    button.mesh.position.y = 1.035;
    setTimeout(() => { button.mesh.position.y = 1.08; }, 180);
    if (button.name !== this.sequence[this.input.length]) {
      this.input = [];
      this.renderPrompt('Secuencia incorrecta. Vuelve a empezar por el primer color.');
      return;
    }
    this.input.push(button.name);
    if (this.input.length === this.sequence.length) {
      this.open = true;
      this.messageUntil = performance.now() + 9000;
      this.renderPrompt('Secuencia correcta. La puerta se abre: atraviesa el pasillo negro.');
      this.lab.lightning(1.4);
    } else this.renderPrompt(`Color correcto (${this.input.length}/4). Continúa la secuencia.`);
  },

  tick(time, dt) {
    if (!this.lab) return;
    const clue = this.open ? null : this.nearestClue();
    if (this.open) {
      this.lab.door.position.x = Math.min(1.55, this.lab.door.position.x + Math.min(dt || 16, 100) * 0.0011);
      document.getElementById('cam').object3D.getWorldPosition(this.head);
      if (!this.transitioning && Math.abs(this.head.x) < 0.7 && this.head.z > ROOM.zFront + 1.1) {
        this.transitioning = true;
        const session = this.el.renderer.xr.getSession();
        Promise.resolve(session ? session.end() : null).finally(() => {
          window.location.href = '../segunda-sala/';
        });
      }
    }
    if (performance.now() < this.messageUntil) return;
    const count = this.clues.filter((item) => item.unlocked).length;
    if (this.open) this.renderPrompt('Atraviesa el pasillo negro para llegar a la segunda sala.');
    else if (clue) this.renderPrompt(`Pulsa el gatillo, haz clic o pulsa E para investigar. Pistas: ${count}/4`);
    else if (this.nearestButton()) this.renderPrompt(count === 4 ? `Pulsa los colores en orden. Progreso: ${this.input.length}/4` : `Primero investiga las cuatro pistas. Pistas: ${count}/4`);
    else this.renderPrompt(count === 4 ? 'Busca la mesa de pulsadores a la izquierda.' : `Acércate a los objetos brillantes y míralos. Pistas: ${count}/4`);
  },

  remove() {
    document.getElementById('rightHand').removeEventListener('triggerdown', this.onAction);
    document.getElementById('leftHand').removeEventListener('triggerdown', this.onAction);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('click', this.onClick);
    this.texture.dispose();
    this.hud.geometry.dispose();
    this.hud.material.dispose();
  }
});
