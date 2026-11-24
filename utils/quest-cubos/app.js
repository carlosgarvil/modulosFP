/* global AFRAME, THREE */

const STARTING_POSES = {
  'cube-coral': { position: '-0.62 1.28 -1.8', rotation: '0 18 0' },
  'cube-mint': { position: '0 1.38 -1.95', rotation: '12 -12 8' },
  'cube-blue': { position: '0.62 1.23 -1.8', rotation: '-8 25 -5' }
};

AFRAME.registerComponent('interactive-cube', {
  schema: { palette: { type: 'array' } },

  init() {
    this.colorIndex = 0;
    this.el.addEventListener('mouseenter', () => this.el.object3D.scale.setScalar(1.12));
    this.el.addEventListener('mouseleave', () => {
      if (!this.el.is('grabbed')) this.el.object3D.scale.setScalar(1);
    });
    this.el.addEventListener('click', () => {
      if (!this.el.sceneEl.is('vr-mode')) this.nextColor();
    });
    this.el.addEventListener('grab-start', () => this.nextColor());
  },

  nextColor() {
    this.colorIndex = (this.colorIndex + 1) % this.data.palette.length;
    this.el.setAttribute('material', 'color', this.data.palette[this.colorIndex]);
  }
});

AFRAME.registerComponent('controller-grab', {
  init() {
    this.grabbed = null;
    this.distance = 0;
    this.rayOrigin = new THREE.Vector3();
    this.rayDirection = new THREE.Vector3();
    this.targetWorldPosition = new THREE.Vector3();
    this.targetLocalPosition = new THREE.Vector3();

    this.el.addEventListener('triggerdown', () => this.beginGrab());
    this.el.addEventListener('triggerup', () => this.endGrab());
  },

  beginGrab() {
    const raycaster = this.el.components.raycaster;
    const hit = raycaster && raycaster.intersections && raycaster.intersections[0];
    const target = hit && hit.object && hit.object.el;
    if (!target || !target.classList.contains('interactive')) return;

    this.grabbed = target;
    this.distance = hit.distance;
    target.pause();
    target.addState('grabbed');
    target.object3D.scale.setScalar(1.12);
    target.emit('grab-start');
  },

  endGrab() {
    if (!this.grabbed) return;
    this.grabbed.removeState('grabbed');
    this.grabbed.object3D.scale.setScalar(1);
    this.grabbed.emit('grab-end');
    this.grabbed = null;
  },

  tick() {
    if (!this.grabbed) return;

    this.el.object3D.getWorldPosition(this.rayOrigin);
    this.el.object3D.getWorldDirection(this.rayDirection).negate().normalize();
    this.targetWorldPosition.copy(this.rayDirection).multiplyScalar(this.distance).add(this.rayOrigin);

    const parent = this.grabbed.object3D.parent;
    this.targetLocalPosition.copy(this.targetWorldPosition);
    parent.worldToLocal(this.targetLocalPosition);
    this.grabbed.object3D.position.copy(this.targetLocalPosition);
  }
});

AFRAME.registerComponent('reset-experiment', {
  init() {
    const reset = () => {
      Object.entries(STARTING_POSES).forEach(([id, pose]) => {
        const cube = document.getElementById(id);
        cube.play();
        cube.object3D.scale.setScalar(1);
        cube.setAttribute('position', pose.position);
        cube.setAttribute('rotation', pose.rotation);
      });
    };

    this.el.addEventListener('loaded', () => {
      const controllers = [document.getElementById('leftHand'), document.getElementById('rightHand')];
      controllers.forEach((controller) => {
        ['abuttondown', 'xbuttondown'].forEach((eventName) => {
          controller.addEventListener(eventName, reset);
        });
      });
    });

    this.el.addEventListener('enter-vr', () => document.body.classList.add('xr-active'));
    this.el.addEventListener('exit-vr', () => document.body.classList.remove('xr-active'));
  }
});

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
