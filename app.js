let scene, camera, renderer, controls;
let mixer;
let clock = new THREE.Clock();
let model;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(2, 2, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // Load GLB model
  const loader = new THREE.GLTFLoader();
  loader.load(
    "model.glb", // <-- your file
    function (gltf) {
      model = gltf.scene;
      scene.add(model);

      mixer = new THREE.AnimationMixer(model);

      if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
      }
    },
    undefined,
    function (error) {
      console.error("Error loading model:", error);
    }
  );

  window.addEventListener("resize", onWindowResize);
}

function playAnimation() {
  if (mixer && mixer._actions[0]) {
    mixer._actions[0].play();
  }
}

function stopAnimation() {
  if (mixer && mixer._actions[0]) {
    mixer._actions[0].stop();
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (mixer) mixer.update(clock.getDelta());

  renderer.render(scene, camera);
}
