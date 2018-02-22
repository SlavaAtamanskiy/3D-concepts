// scene variables
var renderer, scene, camera;
// meshes
var world, hero;
// mesh functionality
var worldSpeed = Math.PI/800;
var heroSpeed  = Math.PI/50;
var jumping;
var leftLane = -1;
var rightLane = 1;
var middleLane = 0;
var currentLane;

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

  var light_am = new THREE.AmbientLight(0xffffff, 0.5);
  var light_po = new THREE.PointLight(0xffffff, 0.5);
  scene.add(light_am);
  scene.add(light_po);

  addWorld();
  addHero();

}

function loop () {
  
    world.rotation.x += worldSpeed;
    hero.rotation.x  -= heroSpeed;
    renderer.render(scene, camera);
    requestAnimationFrame(function (){
        loop ();
    });

}

function addHero() {
	  var geometry = new THREE.DodecahedronGeometry(35, 1);
	  var material = new THREE.MeshStandardMaterial({color: 0xe5f2f2, shading:THREE.FlatShading} )
	  jumping = false;
	  hero = new THREE.Mesh(geometry, material );
	  hero.receiveShadow = true;
	  hero.castShadow = true;
	  scene.add(hero);
    hero.position.set(0, -50, -300);
	  currentLane = middleLane;
	  hero.position.x = currentLane;
}

function addWorld(){

	var sides=600;
	var tiers=600;

  var geometry = new THREE.SphereGeometry(2000, sides, tiers);
  var material = new THREE.MeshStandardMaterial({color: 0x00ff00, shading:THREE.FlatShading});
  var vertexIndex;
	var vertexVector = new THREE.Vector3();
	var nextVertexVector= new THREE.Vector3();
	var firstVertexVector= new THREE.Vector3();
	var offset= new THREE.Vector3();
	var currentTier=1;
	var lerpValue=0.5;
	var heightValue;
	var maxHeight=2.5;
  var mountainCounter = 0;

	for(var j=1;j<tiers-2;j++){
		     currentTier=j;
		     for(var i=0; i<sides; i++){
			             vertexIndex=(currentTier*sides)+1;
			             vertexVector=geometry.vertices[i+vertexIndex].clone();
			             if(j%2!==0){
				               if(i==0){
					                     firstVertexVector=vertexVector.clone();
				               }
				                       nextVertexVector=geometry.vertices[i+vertexIndex+1].clone();
				               if(i==sides-1){
					                     nextVertexVector=firstVertexVector;
				               }
				           lerpValue=(Math.random()*(1.75-1.25))+0.25;
				           vertexVector.lerp(nextVertexVector,lerpValue);
                   mountainCounter++;
			             }
			  heightValue =(mountainCounter === 200)? Math.random()*20 - Math.random()*20:(Math.random()*maxHeight)-(maxHeight/2);
        //heightValue =(Math.random()*maxHeight)-(maxHeight/2);
			  offset = vertexVector.clone().normalize().multiplyScalar(heightValue);
			  geometry.vertices[i+vertexIndex]=(vertexVector.add(offset));
        if (mountainCounter === 200){
            mountainCounter = 0;
        }

		}
	}

  world = new THREE.Mesh(geometry, material);
  world.rotation.z = 90;
  world.position.set(0, -2000, -800);
  world.receiveShadow = true;
  world.castShadow = true;

  scene.add(world);

}

window.onload = function () {

  startGame ();
  loop ();

}
