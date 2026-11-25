/* global AFRAME, THREE */
AFRAME.registerComponent('second-room', {
  init() {
    this.move = new THREE.Vector2();
    this.direction = new THREE.Vector3();
    this.rotation = new THREE.Quaternion();
    this.onMove = (event) => this.move.set(event.detail.x, event.detail.y);
    document.getElementById('leftHand').addEventListener('thumbstickmoved', this.onMove);
    this.el.addEventListener('enter-vr', () => document.body.classList.add('xr-active'));
    this.el.addEventListener('exit-vr', () => document.body.classList.remove('xr-active'));
  },
  tick(time, dtMs) {
    if (this.move.lengthSq() < 0.02) return;
    const camera = document.getElementById('cam').object3D;
    const rig = document.getElementById('rig').object3D;
    camera.getWorldQuaternion(this.rotation);
    this.direction.set(this.move.x, 0, this.move.y).applyQuaternion(this.rotation);
    this.direction.y = 0;
    this.direction.normalize();
    rig.position.addScaledVector(this.direction, Math.min(dtMs || 16, 100) * 0.0016);
    rig.position.x = THREE.MathUtils.clamp(rig.position.x, -3, 3);
    rig.position.z = THREE.MathUtils.clamp(rig.position.z, -8.8, 0.8);
  },
  remove() {
    document.getElementById('leftHand').removeEventListener('thumbstickmoved', this.onMove);
  }
});
