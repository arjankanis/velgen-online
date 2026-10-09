import * as THREE from 'three';

/** Decorative low-poly assets, kept separate from map and game logic. */
const mat=(hex:number)=>new THREE.MeshStandardMaterial({color:hex,roughness:.82,metalness:.04});
const wallColors=[0xe5bb96,0xdba484,0xf0d8b1,0xc6846a,0xf0d4bb,0xb9a08b];
const roofColors=[0xaf5439,0xc56b43,0x8b4b3e,0x434b58,0xd18350];
const windowMat=mat(0x527e91),trimMat=mat(0xf6e8cb),trunkMat=mat(0x74503a);
const leafMats=[mat(0x67a449),mat(0x84b653),mat(0x4f913e),mat(0x9dbd53)];
const sharedWindow=new THREE.BoxGeometry(.9,1.3,.12);
const sharedTrunk=new THREE.CylinderGeometry(.25,.35,3,6);
const sharedLeaf=new THREE.IcosahedronGeometry(2.1,0);
let seed=314159;function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
function mesh(g:THREE.BufferGeometry,m:THREE.Material,scene:THREE.Scene,x:number,y:number,z:number){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
export function prettyTree(scene:THREE.Scene,x:number,z:number,scale=1){
 const trunk=mesh(sharedTrunk,trunkMat,scene,x,1.5*scale,z);trunk.scale.setScalar(scale);
 const crown=mesh(sharedLeaf,leafMats[Math.floor(random()*leafMats.length)],scene,x,4.3*scale,z);crown.scale.set(1.1*scale,1.2*scale,1.1*scale);
 return [trunk,crown];
}
export function detailedHouse(scene:THREE.Scene,x:number,z:number,width:number,depth:number,height:number){
 const wall=mesh(new THREE.BoxGeometry(width,height,depth),mat(wallColors[Math.floor(random()*wallColors.length)]),scene,x,height/2,z);
 const roofColor=mat(roofColors[Math.floor(random()*roofColors.length)]);
 const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(width,depth)*.77,Math.min(6,width*.45),4),roofColor);
 roof.rotation.y=Math.PI/4;roof.position.set(x,height+2,z);roof.castShadow=true;scene.add(roof);
 const floors=Math.min(5,Math.floor(height/3.1)),columns=Math.max(1,Math.floor(width/2.8));
 for(let f=0;f<floors;f++)for(let col=0;col<columns;col++){
  const wx=x-width/2+(col+.5)*width/columns;
  mesh(sharedWindow,trimMat,scene,wx,2.1+f*3.1,z+depth/2+.12).scale.set(1.35,1.3,1);
  mesh(sharedWindow,windowMat,scene,wx,2.1+f*3.1,z+depth/2+.21);
 }
 return wall;
}
export function decorateBuilding(scene:THREE.Scene,points:THREE.Vector2[],height:number){
 if(points.length<4)return;
 const xs=points.map(p=>p.x),zs=points.map(p=>p.y);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
 const w=maxX-minX,d=maxZ-minZ;if(w<2||d<2||w>65||d>65)return;
 const x=(minX+maxX)/2,z=(minZ+maxZ)/2;
 const roof=mesh(new THREE.BoxGeometry(w+.3,.6,d+.3),mat(roofColors[Math.floor(random()*roofColors.length)]),scene,x,height+.3,z);
 roof.castShadow=true;
 const floors=Math.min(5,Math.floor(height/3.3));
 const cols=Math.min(8,Math.floor(w/2.8));
 for(let f=0;f<floors;f++)for(let col=0;col<cols;col++){
  const wx=minX+(col+.5)*w/cols;
  mesh(sharedWindow,windowMat,scene,wx,2+f*3.3,maxZ+.13);
 }
}
export function decorateRoad(scene:THREE.Scene,a:THREE.Vector2,b:THREE.Vector2,width:number){
 const len=a.distanceTo(b);if(len<12||width<5)return;
 const mid=new THREE.Vector2().addVectors(a,b).multiplyScalar(.5);
 const angle=-Math.atan2(b.x-a.x,b.y-a.y);
 const dash=mat(0xf3e5c8);
 for(let i=5;i<len-3;i+=8){
  const t=i/len;const p=a.clone().lerp(b,t);
  const line=mesh(new THREE.PlaneGeometry(.17,3),dash,scene,p.x,.225,p.y);
  line.rotation.x=-Math.PI/2;line.rotation.z=angle;
 }
}
export function addPromenade(scene:THREE.Scene){
 const water=mat(0x3385a8);water.metalness=.15;water.roughness=.28;
 const river=mesh(new THREE.PlaneGeometry(52,300),water,scene,-36,.12,0);river.rotation.x=-Math.PI/2;
 for(let z=-130;z<140;z+=15){prettyTree(scene,-67,z,.8);prettyTree(scene,-4,z,.8)}
 const bridge=mesh(new THREE.BoxGeometry(90,1.6,12),mat(0x6d7073),scene,-36,1.6,0);
 for(const z of [-6.5,6.5]){
  mesh(new THREE.BoxGeometry(90,.4,.4),trimMat,scene,-36,3.4,z);
  for(let x=-79;x<10;x+=6)mesh(new THREE.BoxGeometry(.4,2,.4),trimMat,scene,x,2.6,z);
 }
 for(const x of [-76,5]){
  const base=mesh(new THREE.BoxGeometry(6,13,6),mat(0xc7b59a),scene,x,7,0);
  const cap=mesh(new THREE.ConeGeometry(5,6,4),mat(0x71938b),scene,x,16.5,0);cap.rotation.y=Math.PI/4;
  void base;
 }
 void bridge;
}
