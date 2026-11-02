import * as THREE from 'three';

// Time-based easing keeps the same pace on fast and slow displays.
export function createCameraMotion(camera, controls, reducedMotion) {
  let flight = null;
  function cancel() {
    if (!flight) return;
    controls.enableDamping = flight.damping;
    flight = null;
    document.querySelector('#viewer').setAttribute('aria-busy', 'false');
  }
  function to(position, target = new THREE.Vector3(), duration = 1050) {
    cancel();
    controls.autoRotate = false;
    document.querySelector('#rotate').setAttribute('aria-pressed', 'false');
    const damping = controls.enableDamping;
    // Drain any remaining drag momentum before starting a programmed orbit.
    controls.enableDamping = false;
    controls.update();
    const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    const end = new THREE.Spherical().setFromVector3(position.clone().sub(target));
    end.phi = THREE.MathUtils.clamp(end.phi, controls.minPolarAngle ?? 0, controls.maxPolarAngle ?? Math.PI);
    end.radius = THREE.MathUtils.clamp(end.radius, controls.minDistance ?? 0, controls.maxDistance ?? Infinity);
    const turn = THREE.MathUtils.euclideanModulo(end.theta - from.theta + Math.PI, Math.PI * 2) - Math.PI;
    if (reducedMotion.matches || duration === 0) {
      camera.position.setFromSpherical(end).add(target);
      controls.target.copy(target);
      controls.update();
      controls.enableDamping = damping;
      return;
    }
    flight = { from, end, turn, startTarget: controls.target.clone(), target: target.clone(), start: performance.now(), duration, damping };
    document.querySelector('#viewer').setAttribute('aria-busy', 'true');
  }
  function update(now) {
    if (!flight) return;
    const f = flight;
    const progress = Math.min((now - f.start) / f.duration, 1);
    const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
    const orbit = new THREE.Spherical(
      THREE.MathUtils.lerp(f.from.radius, f.end.radius, eased),
      THREE.MathUtils.lerp(f.from.phi, f.end.phi, eased),
      f.from.theta + f.turn * eased
    );
    controls.target.lerpVectors(f.startTarget, f.target, eased);
    camera.position.setFromSpherical(orbit).add(controls.target);
    controls.update();
    if (progress === 1) cancel();
  }
  controls.addEventListener('start', cancel);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && flight) {
      const destination = new THREE.Vector3().setFromSpherical(flight.end).add(flight.target);
      to(destination, flight.target, 0);
    }
  });
  return { to, update, cancel, get running() { return flight !== null; } };
}
