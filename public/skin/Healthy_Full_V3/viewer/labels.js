import * as THREE from 'three';

export async function createLabels({ model, camera, controls, canvas, bounds, motion }) {
  const response = await fetch(new URL('./labels.json', import.meta.url));
  if (!response.ok) throw new Error('Label content could not load.');
  const groups = await response.json();
  const panel = document.querySelector('#annotations');
  const cards = document.querySelector('#label-cards');
  const svg = document.querySelector('#label-lines');
  const toggle = document.querySelector('#labels-toggle');
  const size = bounds.getSize(new THREE.Vector3());
  const half = size.clone().multiplyScalar(0.5);
  // Three supplied education groups; the fourth vertical face repeats Feel.
  const faces = [
    { normal: new THREE.Vector3(0, 0, 1), group: 0 },
    { normal: new THREE.Vector3(1, 0, 0), group: 1 },
    { normal: new THREE.Vector3(0, 0, -1), group: 2 },
    { normal: new THREE.Vector3(-1, 0, 0), group: 0 }
  ];
  const heights = [0.86, 0.57, 0.25];
  const raycaster = new THREE.Raycaster();
  // Intersect the supplied mesh so connector dots sit on the actual surface.
  for (const face of faces) {
    face.anchors = heights.map(fraction => {
      const origin = new THREE.Vector3(0, bounds.min.y + size.y * fraction, 0);
      if (face.normal.z) { origin.x = half.x * 0.58 * face.normal.z; origin.z = face.normal.z * size.z * 2; }
      else { origin.z = -half.z * 0.58 * face.normal.x; origin.x = face.normal.x * size.x * 2; }
      raycaster.set(origin, face.normal.clone().negate());
      const hit = raycaster.intersectObject(model, true)[0];
      return hit ? hit.point.clone().addScaledVector(face.normal, size.length() * 0.002) : null;
    });
  }
  let activeFace = 0;
  let activeGroup = -1;
  let enabled = true;
  let paths = [];
  let cardElements = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let desiredGroup = -1;
  let transitionId = 0;
  let animations = [];
  const ns = 'http://www.w3.org/2000/svg';
  function renderGroup(group) {
    activeGroup = group;
    document.querySelector('#face-title').textContent = groups[group].title;
    document.querySelectorAll('[data-face]').forEach(button => {
      button.setAttribute('aria-current', Number(button.dataset.face) === group ? 'true' : 'false');
    });
    cards.replaceChildren();
    svg.replaceChildren();
    paths = [];
    cardElements = groups[group].labels.map((label, index) => {
      const card = document.createElement('article');
      card.className = 'label-card';
      const copy = document.createElement('div');
      const title = document.createElement('h3'); title.textContent = label.title;
      const description = document.createElement('p'); description.textContent = label.text;
      copy.append(title, description); card.append(copy); cards.append(card);
      const line = document.createElementNS(ns, 'path');
      const dot = document.createElementNS(ns, 'circle'); dot.setAttribute('r', '4');
      svg.append(line, dot); paths.push({ line, dot });
      return card;
    });
  }
  async function showGroup(group) {
    if (desiredGroup === group) return;
    desiredGroup = group;
    const id = ++transitionId;
    animations.forEach(animation => animation.cancel());
    animations = [];
    const title = document.querySelector('#face-title');
    const options = { easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' };
    if (activeGroup !== -1 && !reducedMotion.matches) {
      const elements = [title, ...cardElements];
      animations = elements.map((element, index) => element.animate(
        [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-7px)' }],
        { ...options, duration: 170, delay: index * 25 }
      ));
      animations.push(svg.animate([{ opacity: 1 }, { opacity: 0 }], { ...options, duration: 150 }));
      await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
      if (id !== transitionId) return;
      animations.forEach(animation => animation.cancel());
    }
    renderGroup(group);
    if (reducedMotion.matches) return;
    animations = [title, ...cardElements].map((element, index) => element.animate(
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { ...options, duration: 460, delay: index * 65 }
    ));
    animations.push(svg.animate([{ opacity: 0 }, { opacity: 1 }], { ...options, duration: 460, delay: 90 }));
    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    if (id !== transitionId) return;
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function goToFace(index) {
    const distance = camera.position.distanceTo(controls.target);
    const position = faces[index].normal.clone().add(new THREE.Vector3(0, 0.4, 0)).normalize().multiplyScalar(distance);
    motion.to(position);
  }
  document.querySelectorAll('[data-face]').forEach(button => button.addEventListener('click', () => goToFace(Number(button.dataset.face))));
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    toggle.setAttribute('aria-pressed', String(enabled));
    panel.hidden = !enabled;
    svg.style.display = enabled ? '' : 'none';
    canvas.classList.toggle('labels-hidden', !enabled);
    window.dispatchEvent(new Event('resize'));
  });
  panel.hidden = false;
  showGroup(0);
  const projected = new THREE.Vector3();
  const direction = new THREE.Vector3();
  function update() {
    if (!enabled) return;
    direction.copy(camera.position).normalize();
    let candidate = activeFace;
    let score = direction.dot(faces[activeFace].normal);
    faces.forEach((face, index) => {
      const next = direction.dot(face.normal);
      if (next > score + 0.08) { score = next; candidate = index; }
    });
    activeFace = candidate;
    if (faces[activeFace].group !== desiredGroup) showGroup(faces[activeFace].group);
    const rect = canvas.getBoundingClientRect();
    const parent = document.querySelector('#viewer').getBoundingClientRect();
    const mobile = window.innerWidth <= 700;
    svg.setAttribute('viewBox', `0 0 ${parent.width} ${parent.height}`);
    camera.updateMatrixWorld();
    const renderedFace = faces[activeFace].group === activeGroup ? activeFace : faces.findIndex(face => face.group === activeGroup);
    faces[renderedFace].anchors.forEach((anchor, index) => {
      const { line, dot } = paths[index];
      const hidden = !anchor || Math.abs(direction.y) > 0.88 || mobile;
      line.style.display = dot.style.display = hidden ? 'none' : '';
      if (hidden) return;
      projected.copy(anchor).project(camera);
      const x = rect.left - parent.left + (projected.x * 0.5 + 0.5) * rect.width;
      const y = rect.top - parent.top + (-projected.y * 0.5 + 0.5) * rect.height;
      if (projected.z < -1 || projected.z > 1 || x < rect.left - parent.left || x > rect.right - parent.left || y < rect.top - parent.top || y > rect.bottom - parent.top) {
        line.style.display = dot.style.display = 'none'; return;
      }
      const card = cardElements[index].getBoundingClientRect();
      const targetX = card.left - parent.left;
      const targetY = card.top - parent.top + card.height / 2;
      const bend = Math.max(x + 18, targetX - 24);
      line.setAttribute('d', `M ${x} ${y} L ${bend} ${y} L ${targetX - 12} ${targetY} L ${targetX} ${targetY}`);
      dot.setAttribute('cx', x); dot.setAttribute('cy', y);
    });
  }
  return { update, goToFace, get activeGroup() { return activeGroup; }, faces };
}
