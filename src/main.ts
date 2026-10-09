import * as THREE from 'three';
const scene=new THREE.Scene();scene.background=new THREE.Color(0xa8d3e2);scene.fog=new THREE.Fog(0xa8d3e2,170,360);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,600);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x6c8b75,2.4));const sun=new THREE.DirectionalLight(0xffedc9,2.5);sun.position.set(-55,100,65);scene.add(sun);
const material=(c:number)=>new THREE.MeshLambertMaterial({color:c});
const grass=material(0x7aa46d),asphalt=material(0x656b6c),stone=material(0xb7b2a5),white=material(0xe9e1c8);
function box(w:number,h:number,d:number,m:THREE.Material,x:number,y:number,z:number){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;scene.add(o);return o}
let seed=12345;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}function between(a:number,b:number){return a+(b-a)*rand()}
box(330,.2,260,grass,0,-.1,0);box(52,.08,270,material(0x377e9a),-36,.04,0);
const roadsX=[-125,-90,10,45,80,115],roadsZ=[-105,-70,-35,0,35,70,105];
for(const x of roadsX){box(10,.14,260,asphalt,x,.12,0);box(1,.15,260,stone,x-6,.14,0);box(1,.15,260,stone,x+6,.14,0)}
for(const z of roadsZ){box(320,.14,10,asphalt,0,.13,z);box(320,.15,1,stone,0,.15,z-6);box(320,.15,1,stone,0,.15,z+6)}
box(94,1.3,12,asphalt,-36,1,0);for(const z of [-7,7])box(94,1,1,stone,-36,2,z);
function tree(x:number,z:number){box(.7,3,.7,material(0x76563a),x,1.5,z);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(between(2,3.2),0),material(0x4b934d));crown.position.set(x,4,z);scene.add(crown)}
const colors=[0xb97e60,0xd7a886,0xe6c8a2,0x9e6d59,0xf0d6b1],roofs=[0xa75438,0xc26a43,0x655455];
function house(x:number,z:number){const h=between(9,21),w=between(8,12),d=between(8,12);box(w,h,d,material(colors[Math.floor(rand()*colors.length)]),x,h/2,z);const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.75,4,4),material(roofs[Math.floor(rand()*roofs.length)]));roof.rotation.y=Math.PI/4;roof.position.set(x,h+2,z);scene.add(roof);for(let f=0;f<Math.floor(h/3.3);f++)for(let a=-w/2+2;a<w/2-1;a+=3.2)box(1,1.5,.12,material(0x4c6571),x+a,2.2+f*3.1,z+d/2+.1)}
for(let x=-145;x<150;x+=15)for(let z=-120;z<120;z+=16){if(x>-65&&x<-7)continue;if(roadsX.some(a=>Math.abs(x-a)<10)||roadsZ.some(a=>Math.abs(z-a)<11))continue;if(rand()<.2)tree(x,z);else house(x+between(-1,1),z+between(-1,1))}
for(let z=-120;z<120;z+=12){tree(-66,z);tree(-5,z)}
box(16,18,18,material(0xc2ae93),46,9,-51);box(8,37,8,material(0xb4a28a),46,28,-51);const spire=new THREE.Mesh(new THREE.ConeGeometry(6,15,4),material(0x444c50));spire.position.set(46,54,-51);scene.add(spire);
function car(c:number,x:number,z:number){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(3,1.2,5.5),material(c));b.position.y=1.2;g.add(b);const top=new THREE.Mesh(new THREE.BoxGeometry(2.5,1,2.8),material(0x95c2cc));top.position.set(0,2.1,-.3);g.add(top);for(const a of [-1.4,1.4])for(const b of [-1.8,1.8]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.3,10),material(0x202429));wheel.rotation.z=Math.PI/2;wheel.position.set(a,.7,b);g.add(wheel)}g.position.set(x,.3,z);scene.add(g);return g}
const generatedWorld=scene.children.filter(o=>!(o instanceof THREE.Light));
const player=car(0xf5d125,10,20);let heading=0,speed=0,driving=true;const playerVehicles:THREE.Group[]=[];playerVehicles.push(player);
const pedestrian=new THREE.Group();const torso=new THREE.Mesh(new THREE.CylinderGeometry(.6,.7,1.7,6),material(0x4d79a3));torso.position.y=1.5;pedestrian.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.48,8,6),material(0xe7b88b));head.position.y=2.8;pedestrian.add(head);pedestrian.visible=false;scene.add(pedestrian);
const traffic:Array<{o:THREE.Group;axis:number;dir:number;v:number}>=[];for(let i=0;i<22;i++){const axis=i%2,dir=i%4<2?1:-1,x=axis?between(-140,140):roadsX[Math.floor(rand()*roadsX.length)]+dir*2,z=axis?roadsZ[Math.floor(rand()*roadsZ.length)]-dir*2:between(-110,110);const o=car([0xce4e40,0x4681a5,0xe9e4d6,0x424d50][i%4],x,z);o.rotation.y=axis?(dir>0?Math.PI/2:-Math.PI/2):(dir>0?0:Math.PI);traffic.push({o,axis,dir,v:between(5,12)});playerVehicles.push(o)}
const keys=new Set<string>();addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e')toggle()});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(b=>{const k=b.dataset.key!;b.addEventListener('pointerdown',e=>{b.setPointerCapture(e.pointerId);keys.add(k)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(k))});document.querySelector('#act')?.addEventListener('click',toggle);
function toggle(){
if(driving){driving=false;pedestrian.visible=true;pedestrian.position.copy(player.position).add(new THREE.Vector3(4,0,0));speed=0}
else{let best:THREE.Group|null=null,dist=8;for(const vehicle of playerVehicles){const d=pedestrian.position.distanceTo(vehicle.position);if(d<dist){dist=d;best=vehicle}}
if(best){if(best!==player){const old=player.position.clone(),angle=player.rotation.y;player.position.copy(best.position);player.rotation.y=best.rotation.y;best.position.copy(old);best.rotation.y=angle;const entry=traffic.find(t=>t.o===best);if(entry){entry.o=player;entry.v=0}}driving=true;pedestrian.visible=false;speed=0;heading=player.rotation.y}}
}
const mini=document.querySelector<HTMLCanvasElement>('#mini')!.getContext('2d')!;const clock=new THREE.Clock();let time=0;
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);time+=dt;const up=keys.has('w')||keys.has('arrowup'),down=keys.has('s')||keys.has('arrowdown'),left=keys.has('a')||keys.has('arrowleft'),right=keys.has('d')||keys.has('arrowright');const target=driving?player:pedestrian;
if(driving){if(up)speed+=22*dt;if(down)speed-=18*dt;if(!up&&!down)speed*=Math.pow(.94,dt*60);if(keys.has(' '))speed*=Math.pow(.8,dt*60);speed=THREE.MathUtils.clamp(speed,-12,28);if(Math.abs(speed)>.2)heading+=(Number(left)-Number(right))*dt*1.8*Math.sign(speed);player.rotation.y=heading;player.position.x-=Math.sin(heading)*speed*dt;player.position.z-=Math.cos(heading)*speed*dt}else{const dx=Number(right)-Number(left),dz=Number(down)-Number(up),len=Math.hypot(dx,dz)||1;pedestrian.position.x+=dx/len*8*dt;pedestrian.position.z+=dz/len*8*dt}
target.position.x=THREE.MathUtils.clamp(target.position.x,-145,145);target.position.z=THREE.MathUtils.clamp(target.position.z,-118,118);
for(const t of traffic){if(t.v===0)continue;if(t.axis){t.o.position.x+=t.dir*t.v*dt;if(Math.abs(t.o.position.x)>145)t.o.position.x*=-1}else{t.o.position.z+=t.dir*t.v*dt;if(Math.abs(t.o.position.z)>120)t.o.position.z*=-1}}
camera.position.lerp(new THREE.Vector3(target.position.x+43,78,target.position.z+70),Math.min(1,dt*3));camera.lookAt(target.position.x,0,target.position.z);document.querySelector('#place')!.textContent=target.position.x>0?'Binnenstad Kampen':'Stadsbrug Kampen';document.querySelector('#clock')!.textContent='12:'+String(Math.floor(time)%60).padStart(2,'0');
mini.clearRect(0,0,240,240);mini.fillStyle='#8bb77d';mini.fillRect(0,0,240,240);mini.fillStyle='#397e9c';mini.fillRect(65,0,42,240);mini.fillStyle='#747a7b';for(const x of roadsX)mini.fillRect((x+150)*.8,0,7,240);for(const z of roadsZ)mini.fillRect(0,(z+125)*.96,240,7);mini.fillStyle='#ffdd21';mini.beginPath();mini.arc((target.position.x+150)*.8,(target.position.z+125)*.96,5,0,Math.PI*2);mini.fill();renderer.render(scene,camera)}frame();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

/* Real Kampen map: roads, water and building outlines from OpenStreetMap.
   Download once at runtime; procedural scene stays as fallback if the service is unavailable. */
type OsmPoint={lat:number;lon:number};
type OsmWay={type:string;tags?:Record<string,string>;geometry?:OsmPoint[]};
const origin={lat:52.556,lon:5.912};
const scale=14000;
function project(p:OsmPoint){return new THREE.Vector2((p.lon-origin.lon)*scale*Math.cos(origin.lat*Math.PI/180),(origin.lat-p.lat)*scale)}
function ribbon(points:THREE.Vector2[],width:number,mat:THREE.Material,y:number){
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=a.distanceTo(b);if(len<.01)continue;const o=new THREE.Mesh(new THREE.PlaneGeometry(width,len),mat);o.rotation.x=-Math.PI/2;o.rotation.z=-Math.atan2(b.x-a.x,b.y-a.y);o.position.set((a.x+b.x)/2,y,(a.y+b.y)/2);scene.add(o)}
}
function osmPolygon(points:THREE.Vector2[],height:number,mat:THREE.Material,y=0){
 if(points.length<3)return;const shape=new THREE.Shape();shape.moveTo(points[0].x,-points[0].y);for(const p of points.slice(1))shape.lineTo(p.x,-p.y);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});geo.rotateX(-Math.PI/2);
 const mesh=new THREE.Mesh(geo,mat);mesh.position.y=y;scene.add(mesh);
}
async function loadKampen(){
 const query='[out:json][timeout:40];(way(52.546,5.889,52.565,5.932)[highway];way(52.546,5.889,52.565,5.932)[building];way(52.546,5.889,52.565,5.932)[waterway];way(52.546,5.889,52.565,5.932)[natural=water];);out geom;';
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),18000);
 try{
  const response=await fetch('https://overpass.kumi.systems/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(query),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:controller.signal});
  if(!response.ok)throw Error('Overpass HTTP '+response.status);
  const data=await response.json() as {elements:OsmWay[]};
  const ways=data.elements.filter(w=>w.geometry&&w.geometry.length>1);
  if(ways.length<50)throw Error('Insufficient OSM data');
  for(const obj of generatedWorld)scene.remove(obj);
  box(600,.2,600,grass,0,-.1,0);
  const road=material(0x63676c),river=material(0x3988a7),buildingMats=[material(0xd5aa86),material(0xe7d1af),material(0xba8b72)];
  for(const way of ways){const pts=way.geometry!.map(project);
   if(way.tags?.natural==='water')osmPolygon(pts,.06,river,.05);
   else if(way.tags?.waterway)ribbon(pts,way.tags.waterway==='river'?18:5,river,.08);
   else if(way.tags?.highway){const category=way.tags.highway;const width=['primary','secondary','tertiary','trunk'].includes(category)?8:['footway','path','pedestrian','cycleway'].includes(category)?2.2:5;ribbon(pts,width,road,.13)}
   else if(way.tags?.building){const floors=Number(way.tags['building:levels']);const height=Number.isFinite(floors)&&floors>0?Math.min(30,floors*3.3):between(7,17);osmPolygon(pts,height,buildingMats[Math.floor(rand()*buildingMats.length)])}
  }
  player.position.set(20,.3,20);
  const roads=ways.filter(w=>w.tags?.highway&&w.geometry&&w.geometry.length>1);
  for(const t of traffic){const way=roads[Math.floor(rand()*roads.length)];if(!way)continue;const a=project(way.geometry![0]),b=project(way.geometry![1]);t.o.position.set(a.x,.3,a.y);t.o.rotation.y=-Math.atan2(b.x-a.x,b.y-a.y);t.v=0}
  document.querySelector('#place')!.textContent='Kampen · OpenStreetMap';
 }catch(err){console.warn('OSM unavailable; using stylized fallback',err)}
 finally{clearTimeout(timeout)}
}
void loadKampen();
