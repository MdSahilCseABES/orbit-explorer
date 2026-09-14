import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const planets = [
  { name: 'Mercury', type: 'THE SWIFT PLANET', color: '#a49a88', radius: .19, orbit: 3.15, speed: 1.6, distance: '57.9', period: '88', unit: 'DAYS', symbol: '☿', description: 'Small but full of extremes. This crater-covered world races around the Sun faster than any other planet.', phase: 2.9 },
  { name: 'Venus', type: 'THE MORNING STAR', color: '#d7b785', radius: .31, orbit: 4.35, speed: 1.15, distance: '108.2', period: '225', unit: 'DAYS', symbol: '♀', description: 'Wrapped in thick golden clouds, our nearest planetary neighbor is the hottest world in the solar system.', phase: 4.2 },
  { name: 'Earth', type: 'THE BLUE PLANET', color: '#639db0', radius: .35, orbit: 5.7, speed: .85, distance: '149.6', period: '365', unit: 'DAYS', symbol: '⊕', description: 'Our pale blue dot. The only world we know of with liquid oceans on the surface and life among the stars.', phase: .65 },
  { name: 'Mars', type: 'THE RED PLANET', color: '#bd6d46', radius: .26, orbit: 7, speed: .65, distance: '227.9', period: '687', unit: 'DAYS', symbol: '♂', description: 'A rusty desert with giant volcanoes and ancient riverbeds. The next great horizon for human exploration.', phase: 3.7 },
  { name: 'Jupiter', type: 'KING OF THE PLANETS', color: '#c7aa88', radius: .86, orbit: 9.05, speed: .36, distance: '778.6', period: '11.9', unit: 'YEARS', symbol: '♃', description: 'A magnificent gas giant with swirling cloud bands and a storm bigger than Earth. A world with a family of moons.', phase: 5.65 },
  { name: 'Saturn', type: 'THE RINGED WORLD', color: '#c8b686', radius: .68, orbit: 11.55, speed: .25, distance: '1,433', period: '29.4', unit: 'YEARS', symbol: '♄', description: 'An elegant giant surrounded by countless pieces of ice and rock. Its spectacular rings span hundreds of thousands of kilometers.', phase: 2.9 },
  { name: 'Uranus', type: 'THE SIDEWAYS PLANET', color: '#8fc3c6', radius: .46, orbit: 14, speed: .17, distance: '2,872', period: '84', unit: 'YEARS', symbol: '♅', description: 'A quiet, blue-green ice giant tipped on its side. Here, the seasons last for decades and the winds never stop.', phase: 4.4 },
  { name: 'Neptune', type: 'BEYOND THE BLUE', color: '#456bc1', radius: .44, orbit: 16.4, speed: .12, distance: '4,495', period: '165', unit: 'YEARS', symbol: '♆', description: 'Dark, cold, and swept by supersonic winds. This deep-blue giant guards the outer edge of our planetary neighborhood.', phase: 1.55 },
];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected = 2;
let paused = reducedMotion;
let speed = 1;
let focused = false;
let sceneReady = false;
let controls, camera, renderer, scene, selectionRing;
let focusTransition = false;
const meshes = [];
const container = document.querySelector('#universe');
const list = document.querySelector('#planet-list');

planets.forEach((planet, index) => {
  const button = document.createElement('button');
  button.className = `planet-button${index === selected ? ' selected' : ''}`;
  button.dataset.name = planet.name;
  button.setAttribute('aria-pressed', String(index === selected));
  button.innerHTML = `<span class="planet-thumb" style="background:radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color} 30%, #182024)"></span><span class="planet-button-text"><strong>${planet.name}</strong><small>0${index + 1} / ${index < 4 ? 'ROCKY' : index < 6 ? 'GAS GIANT' : 'ICE GIANT'}</small></span>`;
  button.addEventListener('click', () => selectPlanet(index));
  list.append(button);
});

function selectPlanet(index) {
  selected = index;
  const planet = planets[index];
  document.querySelector('#planet-index').textContent = `0${index + 1} / 08`;
  document.querySelector('#planet-name').textContent = planet.name;
  document.querySelector('#planet-type').textContent = planet.type;
  document.querySelector('#planet-description').textContent = planet.description;
  document.querySelector('#planet-symbol').textContent = planet.symbol;
  document.querySelector('#planet-distance').innerHTML = `${planet.distance} <small>M KM</small>`;
  document.querySelector('#planet-period').innerHTML = `${planet.period} <small>${planet.unit}</small>`;
  [...list.children].forEach((button, i) => {
    button.classList.toggle('selected', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  if (focused) focusPlanet();
}

function makeTexture(planet) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = planet.color;
  ctx.fillRect(0, 0, 512, 256);
  let seed = planet.name.charCodeAt(0) * 9127;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  if (planet.name === 'Earth') {
    ctx.fillStyle = '#396f8c';
    ctx.fillRect(0, 0, 512, 256);
    const continents = [[70,57,48,42], [117,133,27,60], [257,70,39,20], [276,126,36,51], [346,66,76,34], [398,175,30,20]];
    continents.forEach(([x,y,rx,ry]) => {
      ctx.beginPath();
      for (let i = 0; i < 30; i++) {
        const a = i / 30 * Math.PI * 2;
        const variation = .65 + random() * .5;
        const px = x + Math.cos(a) * rx * variation;
        const py = y + Math.sin(a) * ry * variation;
        i ? ctx.lineTo(px,py) : ctx.moveTo(px,py);
      }
      ctx.closePath(); ctx.fillStyle = '#708e6a'; ctx.fill();
    });
    ctx.fillStyle = '#d7e4dd'; ctx.fillRect(0, 0, 512, 12); ctx.fillRect(0, 242, 512, 14);
    for (let i = 0; i < 65; i++) {
      ctx.fillStyle = `rgba(236,244,239,${random() * .35})`;
      ctx.beginPath(); ctx.ellipse(random()*512,random()*256,random()*40+7,random()*5+1,-.25,0,Math.PI*2); ctx.fill();
    }
  } else if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(planet.name)) {
    for (let y = 0; y < 256; y += 2) {
      const light = Math.sin(y * .13) * .12 + Math.sin(y * .37) * .055;
      ctx.fillStyle = light > 0 ? `rgba(255,241,211,${light})` : `rgba(74,44,25,${-light * 2})`;
      ctx.fillRect(0, y, 512, 2 + random() * 4);
    }
    if (planet.name === 'Jupiter') {
      ctx.fillStyle = '#a47c61'; ctx.beginPath(); ctx.ellipse(330,162,32,12,0,0,Math.PI*2); ctx.fill();
    }
  }
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = random() > .5 ? '#ffffff09' : '#0000000b';
    ctx.fillRect(random()*512,random()*256,random()*3+1,random()*3+1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function glowTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(255,211,125,1)');
  gradient.addColorStop(.15,'rgba(245,159,61,.65)');
  gradient.addColorStop(.4,'rgba(239,131,40,.16)');
  gradient.addColorStop(1,'rgba(239,131,40,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(canvas);
}

function initializeScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(39, container.clientWidth / container.clientHeight, .1, 250);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x080a0c, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .045;
  controls.enablePan = false;
  controls.minDistance = 2.5;
  controls.maxDistance = 85;
  controls.maxPolarAngle = Math.PI * .82;
  controls.addEventListener('start', () => { focusTransition = false; });
  resetView();

  scene.add(new THREE.AmbientLight(0xb9c9e2, 1.1));
  scene.add(new THREE.PointLight(0xffe4b3, 95, 0, 1.4));
  const fill = new THREE.DirectionalLight(0xd6e8ff, 1.4);
  fill.position.set(-5,12,15); scene.add(fill);

  const starPositions = new Float32Array(1800 * 3);
  for (let i = 0; i < 1800; i++) {
    const theta = Math.random()*Math.PI*2;
    const phi = Math.acos(2*Math.random()-1);
    const r = 65 + Math.random()*45;
    starPositions[i*3] = r*Math.sin(phi)*Math.cos(theta);
    starPositions[i*3+1] = r*Math.cos(phi);
    starPositions[i*3+2] = r*Math.sin(phi)*Math.sin(theta);
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions,3));
  scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({color:0x98a9b4,size:.07,transparent:true,opacity:.6,sizeAttenuation:true})));

  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.3,64,32),new THREE.MeshBasicMaterial({map:makeTexture({name:'Sun',color:'#efbb68'}),color:0xffd391}));
  scene.add(sun);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
  glow.scale.set(11,11,1); scene.add(glow);

  planets.forEach((planet,index) => {
    const points = [];
    for(let i=0;i<256;i++) {
      const angle = i / 256 * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle)*planet.orbit,0,Math.sin(angle)*planet.orbit));
    }
    const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x727d80,transparent:true,opacity:.24}));
    scene.add(orbit);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(planet.radius,48,32),new THREE.MeshStandardMaterial({map:makeTexture(planet),roughness:.92,metalness:.02}));
    mesh.userData.planetIndex = index;
    mesh.position.set(Math.cos(planet.phase)*planet.orbit,0,Math.sin(planet.phase)*planet.orbit);
    mesh.rotation.z = .1;
    scene.add(mesh); meshes.push(mesh);
    if(planet.name === 'Saturn') {
      const rings = new THREE.Group();
      for(let i=0;i<5;i++) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(planet.radius*1.4+i*.12,planet.radius*1.5+i*.12,128),new THREE.MeshStandardMaterial({color:i%2?0xa39371:0xc6b98e,side:THREE.DoubleSide,transparent:true,opacity:.7,roughness:1}));
        ring.rotation.x = Math.PI/2; rings.add(ring);
      }
      rings.rotation.z = -.35; mesh.add(rings);
    }
    if(planet.name === 'Earth') {
      const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(planet.radius*1.045,32,24),new THREE.MeshBasicMaterial({color:0x74bcff,transparent:true,opacity:.13,side:THREE.BackSide}));
      mesh.add(atmosphere);
    }
  });

  const beltPositions = new Float32Array(1100*3);
  for(let i=0;i<1100;i++) {
    const angle = Math.random()*Math.PI*2; const r = 7.65 + Math.random()*.6;
    beltPositions[i*3] = Math.cos(angle)*r;
    beltPositions[i*3+1] = (Math.random()-.5)*.12;
    beltPositions[i*3+2] = Math.sin(angle)*r;
  }
  const beltGeometry = new THREE.BufferGeometry();
  beltGeometry.setAttribute('position',new THREE.BufferAttribute(beltPositions,3));
  scene.add(new THREE.Points(beltGeometry,new THREE.PointsMaterial({color:0xa69c85,size:.023,transparent:true,opacity:.48})));

  selectionRing = new THREE.Mesh(new THREE.RingGeometry(1,1.025,80),new THREE.MeshBasicMaterial({color:0xd8ef95,transparent:true,opacity:.7,side:THREE.DoubleSide,depthTest:false}));
  scene.add(selectionRing);
  sceneReady = true;
  document.querySelector('#loading').classList.add('hidden');

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerStart = null;
  renderer.domElement.addEventListener('pointerdown',event => {pointerStart = {x:event.clientX,y:event.clientY};});
  renderer.domElement.addEventListener('pointerup',event => {
    if(!pointerStart || Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>5) return;
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hit = raycaster.intersectObjects(meshes,false)[0];
    if(hit) selectPlanet(hit.object.userData.planetIndex);
    pointerStart = null;
  });

  const resizeObserver = new ResizeObserver(() => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth,container.clientHeight);
  });
  resizeObserver.observe(container);

  const clock = new THREE.Clock();
  const previousTarget = new THREE.Vector3();
  const movement = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();
  renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(),.05);
    if(document.hidden) return;
    if(focused) previousTarget.copy(meshes[selected].position);
    planets.forEach((planet,index) => {
      if(!paused) {
        planet.phase += delta*planet.speed*speed*.045;
        meshes[index].rotation.y += delta*.12*speed;
      }
      meshes[index].position.set(Math.cos(planet.phase)*planet.orbit,0,Math.sin(planet.phase)*planet.orbit);
    });
    const target = meshes[selected].position;
    if(focused) {
      movement.subVectors(target,previousTarget);
      camera.position.add(movement); controls.target.add(movement);
      if(focusTransition) {
        const distance = Math.max(planets[selected].radius*8,3.7);
        desiredCamera.copy(target).add(new THREE.Vector3(distance*.6,distance*.45,distance));
        const alpha = reducedMotion ? 1 : 1-Math.exp(-delta*4);
        controls.target.lerp(target,alpha);
        camera.position.lerp(desiredCamera,alpha);
        if(camera.position.distanceTo(desiredCamera)<.02) focusTransition = false;
      }
    }
    selectionRing.position.copy(target);
    selectionRing.quaternion.copy(camera.quaternion);
    selectionRing.scale.setScalar(planets[selected].radius*1.5);
    controls.update();
    renderer.render(scene,camera);
  });
}

function resetView() {
  if(!camera || !controls) return;
  focused = false; focusTransition = false;
  const mobile = window.innerWidth <= 760;
  controls.target.set(mobile ? 0 : -2.4,0,0);
  camera.position.set(mobile ? 18 : 20,mobile ? 32 : 25,mobile ? 49 : 32);
  controls.update();
  document.querySelector('#focus-button').innerHTML = 'Get a closer look <span>↗</span>';
}

function focusPlanet() {
  if(!sceneReady) return;
  focused = true; focusTransition = true;
  document.querySelector('#focus-button').innerHTML = 'Back to the solar system <span>↗</span>';
}

function zoom(factor) {
  if(!sceneReady) return;
  focusTransition = false;
  const offset = camera.position.clone().sub(controls.target);
  offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));
  camera.position.copy(controls.target).add(offset);
  controls.update();
}

function updatePlayback() {
  const button = document.querySelector('#pause-button');
  button.textContent = paused ? '▶' : 'Ⅱ';
  button.setAttribute('aria-label',paused ? 'Play simulation' : 'Pause simulation');
}

document.querySelector('#pause-button').addEventListener('click',() => {paused = !paused; updatePlayback();});
document.querySelector('#speed-button').addEventListener('click',event => {speed = speed === 1 ? 5 : speed === 5 ? 20 : 1; event.currentTarget.textContent = `${speed}×`;});
document.querySelector('#reset-button').addEventListener('click',resetView);
document.querySelector('#zoom-in').addEventListener('click',() => zoom(.8));
document.querySelector('#zoom-out').addEventListener('click',() => zoom(1.25));
document.querySelector('#focus-button').addEventListener('click',() => focused ? resetView() : focusPlanet());
document.querySelector('#journey-button').addEventListener('click',() => {selectPlanet(2); focusPlanet(); document.querySelector('.planet-card').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'nearest'});});
document.querySelector('#explore-nav').addEventListener('click',() => {resetView(); document.querySelector('.explorer-panel').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'nearest'});});
const dialog = document.querySelector('#mission-dialog');
document.querySelector('#about-button').addEventListener('click',() => dialog.showModal());
document.querySelector('#close-dialog').addEventListener('click',() => dialog.close());
document.querySelector('#dialog-explore').addEventListener('click',() => {dialog.close(); focusPlanet();});
dialog.addEventListener('click',event => {if(event.target === dialog) {const rect = dialog.getBoundingClientRect(); if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) dialog.close();}});
updatePlayback();

try {
  initializeScene();
} catch(error) {
  console.error('Unable to initialize the 3D scene:',error);
  document.querySelector('#loading').textContent = '3D requires WebGL. You can still explore all eight planets below.';
  for(const id of ['focus-button','reset-button','zoom-in','zoom-out','pause-button','speed-button']) document.getElementById(id).disabled = true;
}
