async function analyze() {
  const res = await fetch('https://taipei-gta.vercel.app/assets/game-vXklz4A8.js');
  const code = await res.text();
  console.log('File size:', (code.length / 1024).toFixed(1), 'KB');
  console.log('Has three.js:', /three/i.test(code));
  console.log('Has webgl:', /webgl/i.test(code));
  console.log('Has getContext:', code.match(/getContext\(['"][^'"]+['"]\)/g));
  console.log('Draw calls:', (code.match(/drawElements|drawArrays/g) || []).length);
  
  // Find shader code (void main, attribute, uniform, precision)
  const glsl = code.match(/precision (mediump|highp) float/g);
  console.log('GLSL shaders:', glsl);

  // How are 3D meshes created?
  const instanced = code.match(/drawElementsInstanced|drawArraysInstanced|instanced/gi);
  console.log('Instanced mentions:', instanced ? instanced.slice(0, 10) : 'None');

  // Look for vehicle rendering
  const scooterIdx = code.indexOf('scooter');
  if (scooterIdx !== -1) {
    console.log('Around scooter:', code.slice(Math.max(0, scooterIdx - 100), scooterIdx + 200));
  }
}

analyze().catch(console.error);
