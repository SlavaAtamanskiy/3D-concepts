// scene variables
var font_source = 'https://raw.githubusercontent.com/SlavaAtamanskiy/3D-concepts/development/js/helvetiker_bold.typeface.json';
var renderer, scene, camera, clock, position, status = '';
// meshes
var world, hero;
// mesh functionality
var worldSpeed = Math.PI/800;
var heroSpeed  = Math.PI/35;
var heroAxisY  = -115;
var jumping;
var gravity    = 0;
var bounce     = 0.5;
var pace       = 150;
var paceCount  = 2;
var leftLane   = -(pace);
var rightLane  = pace;
var middleLane = 0;
var currentLane;
var symbolsInPath;
var symbols;

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
  camera = new THREE.PerspectiveCamera(40, width/height, 0.1, 1000);
  camera.position.set(0, 0, 375);

  //lights
  var light_am = new THREE.AmbientLight(0xffffff, 0.5);
  var light_po = new THREE.PointLight(0xffffff, 0.5);
  scene.add(light_am);
  scene.add(light_po);

  //clock
  clock = new THREE.Clock();
	clock.start();

  //scene decorations
  position = new THREE.Spherical(); //helps to set an object`s position on a sphere
  symbolsInPath = [];
	symbols = [];

  //dev
  addDevTools();

  addWorld();
  addHero();

  createSymbols();

  document.onkeydown = handleKeyDown;

}

function loop () {

    //meshes rotation
    world.rotation.x += worldSpeed;
    hero.rotation.x  -= heroSpeed;

    //game logic

    //bouncing and jumping
    addHeroBouncing();
    //left and right smooth moves
    hero.position.x = THREE.Math.lerp(hero.position.x, currentLane, 2*clock.getDelta());

    //rendering and refreshing
    renderer.render(scene, camera);
    requestAnimationFrame(function (){
        loop ();
    });

}

function handleKeyDown(keyEvent){

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

function createSymbols(){
    //debug
    var alphabet = 'A,B,C,D,E';
    //debug
    var arr = alphabet.split(',');
    var leng = arr.length;
    var createdSymbols = []; //filter
    var i = 0;

    var loader = new THREE.FontLoader();
    loader.load(font_source, function (font) {
          while (i < leng) {
                var sym = arr[Math.floor(Math.random()*leng)];
                var x = createdSymbols.find(function (o) {
                                       return o === sym;
                                    });
                if (x === undefined) {
                   symbols.push(createSymbol(sym, font));
                   createdSymbols.push(sym);
                   i++;
            }

      }

    });

}

function createSymbol(sym, font){

  var material = new THREE.MeshPhongMaterial({color: 0xdddddd});
  var textGeom = new THREE.TextGeometry(sym, {
      font: font,
      size: 50,
      height: 10,
      curveSegments: 12,
      bevelThickness: 1,
      bevelSize: 1,
      bevelEnabled: true//normal or italics(both don't always work with all fonts)

  });
  var textMesh = new THREE.Mesh(textGeom, material);
  scene.add(textMesh);

  // Do some optional calculations. This is only if you need to get the
  // width of the generated text
  textGeom.computeBoundingBox();
  textGeom.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;

}

function addHero() {
	  var geometry = new THREE.DodecahedronGeometry(35, 1);
	  var material = new THREE.MeshStandardMaterial({color: 0xe5f2f2, shading:THREE.FlatShading} )
	  jumping = false;
	  hero = new THREE.Mesh(geometry, material );
	  hero.receiveShadow = true;
	  hero.castShadow = true;
	  scene.add(hero);
    hero.position.set(0, heroAxisY, -100);
	  currentLane = middleLane;
	  hero.position.x = currentLane;
}

function addWorld(){

	var sides = 200;
	var tiers = 200;
  var radius= 2000;

  var geometry = new THREE.SphereGeometry(radius, sides, tiers);
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

//Bouncing and jumping logic
//
function addHeroBouncing() {

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

function addDevTools() {

  //An axis object to visualize the 3 axes in a simple way.
  //The X axis is red. The Y axis is green. The Z axis is blue.
  var axesHelper = new THREE.AxesHelper(500);
  scene.add(axesHelper);

}

window.onload = function () {

  startGame ();
  loop ();

}
