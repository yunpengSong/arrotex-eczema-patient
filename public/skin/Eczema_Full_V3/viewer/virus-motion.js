import * as THREE from 'three';

// Spin each object at its own geometric centre, retaining its source transform.
export function createVirusMotion(model, reducedMotion) {
  const meshes = [];
  model.traverse(node => {
    if (node.isMesh && /^Virus[_ ]\d/.test(node.name)) meshes.push(node);
  });
  const speeds = [0.30, -0.24, 0.34, -0.28];
  const objects = meshes.map((mesh, index) => {
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    // Elongated viruses spin about their long axis; round ones use local Y.
    const longest = Math.max(size.x, size.y, size.z);
    const shortest = Math.min(size.x, size.y, size.z);
    const axis = longest / shortest > 1.5
      ? (size.x === longest ? new THREE.Vector3(1, 0, 0) : size.z === longest ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0))
      : new THREE.Vector3(0, 1, 0);
    const pivot = new THREE.Group();
    pivot.name = `${mesh.name}_spin`;
    pivot.position.copy(center).multiply(mesh.scale).applyQuaternion(mesh.quaternion).add(mesh.position);
    pivot.quaternion.copy(mesh.quaternion);
    pivot.scale.copy(mesh.scale);
    mesh.parent.add(pivot);
    pivot.add(mesh);
    mesh.position.copy(center).negate();
    mesh.quaternion.identity();
    mesh.scale.set(1, 1, 1);
    return { pivot, axis, speed: speeds[index % speeds.length] };
  });
  model.updateMatrixWorld(true);
  return {
    count: objects.length,
    update(delta) {
      if (reducedMotion.matches) return;
      for (const object of objects) object.pivot.rotateOnAxis(object.axis, object.speed * delta);
    }
  };
}
