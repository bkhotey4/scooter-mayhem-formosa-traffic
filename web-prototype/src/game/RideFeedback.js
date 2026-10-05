// Exact critically damped spring: consistent suspension at different frame rates.
export function dampedSpring(position, velocity, target, frequency, dt) {
  const offset = position - target;
  const impulse = velocity + frequency * offset;
  const decay = Math.exp(-frequency * dt);
  return [(offset + impulse * dt) * decay + target,
    (velocity - frequency * impulse * dt) * decay];
}

export function cameraProfile(mode) {
  return mode === 'dynamic'
    ? { weight: 1, shake: 1, bank: 1, fov: 1, lines: 1, suspension: 1 }
    : { weight: 0.2, shake: 0, bank: 0, fov: 0, lines: 0, suspension: 0.15 };
}

export function isTypingTarget(target) {
  return !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}
