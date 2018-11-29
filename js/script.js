// scene variables
var font_source = 'https://raw.githubusercontent.com/SlavaAtamanskiy/3D-concepts/development/js/helvetiker_bold.typeface.json';
var alphabet = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z';
var renderer, scene, camera, clock, position, status = '';
// meshes
var world, hero;
// mesh functionality
var worldSpeed = Math.PI/600;
var worldRadius= 2000;
var heroSpeed  = Math.PI/25;
var heroAxisY  = -230;
//hero moves
var jumping;
var gravity    = 0;
var bounce     = 0.5;
var pace       = 150;
var paceCount  = 2;
var leftLane   = -(pace);
var rightLane  = pace;
var middleLane = 0;
var currentLane;
//symbols logic
var symbolsInPath = [];
var symbols = [];
//explosion
var particleGeometry;
var particleCount = 20;
var explosionPower = 1.06;
var particles;

function startGame () {

  var canvas = document.getElementById('canvas');
  var width  = window.innerWidth;
  var height = window.innerHeight;
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);

  //renderer
  renderer = new THREE.WebGLRenderer({canvas: canvas, alpha:true});
  renderer.setClearColor(0xfffafa, 1);
  renderer.setPixelRatio = window.devicePixelRatio;
  renderer.shadowMap.enabled = true; //enable shadow
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  //scene
  scene  = new THREE.Scene();

  //camera
  camera = new THREE.PerspectiveCamera(40, width/height, 0.1, 2000);
  camera.position.set(0, -100, 675);

  //lights
  var light_am = new THREE.AmbientLight(0xffffff, 0.5);
  var light_po = new THREE.PointLight(0xffffff, 0.5);
  light_po.position.set(0, -100, 675);
  scene.add(light_am);
  scene.add(light_po);

  //clock
  clock = new THREE.Clock();
	clock.start();

  //scene decorations
  position = new THREE.Spherical(); //helps to set an object`s position on a sphere

  //dev
  addDevTools ();

  addWorld ();
  addHero ();
  //addExplosion ();
  createEnvironment ();

  document.onkeydown = handleKeyDown;

}

function loop () {

    //meshes rotation
    world.rotation.x += worldSpeed;
    hero.rotation.x  -= heroSpeed;

    //game logic

    //moves, bouncing and jumping
    addHeroMoves();

    //rendering and refreshing
    renderer.render(scene, camera);
    requestAnimationFrame(function (){
        loop ();
    });

}

function handleKeyDown (keyEvent) {

  if(jumping)return;

  if (keyEvent.keyCode === 32){//space, jump
         bounce  = 5;
         jumping = true;
         return;
  }

	if (keyEvent.keyCode === 37 && currentLane !== -(pace*paceCount)) {//left
		  currentLane -= pace;
	} else if (keyEvent.keyCode === 39 && currentLane !== pace*paceCount) {//right
      currentLane += pace;
	}

}

function createEnvironment () {

    //symbols
    var arr = alphabet.split(',');
    var leng = arr.length;
    var createdSymbols = []; //filter
    var i = 0;

    var loader = new THREE.FontLoader();
    loader.load(font_source, function (font) {
      //unique values
      while (i < leng) {
                var sym = arr[Math.floor(Math.random()*leng)];
                var x = createdSymbols.find(function (o) {
                                       return o === sym;
                                    });
                if (x === undefined) {
                   symbols.push(createSymbol(sym, font, i));
                   createdSymbols.push(sym);
                   i++;
            }

      }
      i=0;
      while (i < 35) {
                var sym = arr[Math.floor(Math.random()*leng)];
                symbols.push(createSymbol(sym, font, i));
            i++;
      }

    });

}

function createSymbol (sym, font, counter) {

  var material = new THREE.MeshPhongMaterial({color: 0x85ebf7});
  var textGeom = new THREE.TextGeometry(sym, {
      font: font,
      size: 100,
      height: 50,
      curveSegments: 12,
      bevelThickness: 1,
      bevelSize: 1,
      bevelEnabled: true//normal or italics(both don't always work with all fonts)

  });
  var textMesh = new THREE.Mesh(textGeom, material);

  // Do some optional calculations. This is only if you need to get the
  // width of the generated text
  textGeom.computeBoundingBox();
  textGeom.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;

  position.set(worldRadius, (counter%2) > 0 ? 1.7 : 1.2, world.rotation.x+=45);
  textMesh.position.setFromSpherical(position);
  /*
  var dir = (Math.floor(Math.random()*2) === 1) ? 1 : -1;
  var axis_x = (Math.floor(Math.random()*(pace*2)))*dir;
  textMesh.position.set(axis_x, -50, -50);
  textMesh.rotation.y = Math.floor(Math.random()*35);
  */
  var worldVector = world.position.clone().normalize();
  var textVector  = textMesh.position.clone().normalize();
  textMesh.quaternion.setFromUnitVectors(textVector, worldVector);
  //textMesh.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;
  world.add(textMesh);

  return textMesh;

}

function addHero () {
	  var geometry = new THREE.DodecahedronGeometry(35, 1);
	  var material = new THREE.MeshStandardMaterial({color: 0xe5f2f2, shading:THREE.FlatShading} )
	  jumping = false;
	  hero = new THREE.Mesh(geometry, material);
	  hero.receiveShadow = true;
	  hero.castShadow = true;
	  scene.add(hero);
    hero.position.set(0, heroAxisY, 140);
	  currentLane = middleLane;
	  hero.position.x = currentLane;
}

function addWorld () {

	var sides = 200;
	var tiers = 200;

  var geometry = new THREE.SphereGeometry(worldRadius, sides, tiers);
  var material = new THREE.MeshStandardMaterial({color: 0x00ff00, shading:THREE.FlatShading, wireframe: false});
  var maxHeight=80;

  if (clock.running){
      clock.stop();
  }
  clock.start();
  var cur = 1;
  var val = 0;
  for(var i = 0; i < geometry.vertices.length; i++){
      val += 20*clock.getDelta()*cur;
      if (maxHeight < Math.abs(val)) {
         cur = cur*(-1);
      }
      geometry.vertices[i].x += -10 + Math.random()*20*val;
      geometry.vertices[i].y += -10 + Math.random()*20*val;
  }

  world = new THREE.Mesh(geometry, material);
  world.rotation.z = 90;
  world.position.set(0, -2000, -800);
  world.receiveShadow = true;
  world.castShadow = true;

  scene.add(world);

}

//Moves. Bouncing and jumping logic
//
function addHeroMoves () {

  //left and right smooth moves
  hero.position.x = THREE.Math.lerp(hero.position.x, currentLane, 2*clock.getDelta());

  //jumping
  if(jumping) {
    if(status === 'decreasing') {
        gravity -= 0.06;
        hero.position.y -= (bounce - gravity);
        if(hero.position.y < heroAxisY){
            hero.position.y = heroAxisY;
            bounce  = 0.5;
            jumping = false;
            status = '';
        }
    }
    else{
       if (status !== 'decreasing') {
            gravity += 0.06;
            if (bounce - gravity < 0){
               status = 'decreasing';
            }
            hero.position.y += (bounce - gravity);
       }
    }
    return;
  }

  //bouncing
  hero.position.y += bounce;
  var margin = 45;
  if(Math.abs(hero.position.y) < Math.abs(heroAxisY) - margin){
      hero.position.y = heroAxisY;
  }
  if(Math.abs(hero.position.y) < Math.abs(heroAxisY) - Math.floor(Math.random()*margin)){
      hero.position.y = heroAxisY;
  }

}

function addExplosion () {

  particleGeometry = new THREE.Geometry();
	for (var i = 0; i < particleCount; i ++) {
		   var vertex = new THREE.Vector3();
		   particleGeometry.vertices.push(vertex);
	}
	var pMaterial = new THREE.ParticleBasicMaterial({
	     color: 0xfffafa,
	     size: 0.2
	});
	particles = new THREE.Points(particleGeometry, pMaterial);
	scene.add(particles);
	particles.visible = true;

}

function addDevTools () {

  //An axis object to visualize the 3 axes in a simple way.
  //The X axis is red. The Y axis is green. The Z axis is blue.
  var axesHelper = new THREE.AxesHelper(500);
  scene.add(axesHelper);

}

window.onload = function () {

  startGame ();
  loop ();

}
