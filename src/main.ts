import * as THREE from 'three';
import {decorateRoad} from './visuals';
const scene=new THREE.Scene();scene.background=new THREE.Color(0xa8d3e2);scene.fog=new THREE.Fog(0xa8d3e2,350,1600);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,3000);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.55;document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x6c8b75,2.4));const sun=new THREE.DirectionalLight(0xffedc9,2.5);sun.position.set(-55,100,65);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-170;sun.shadow.camera.right=170;sun.shadow.camera.top=170;sun.shadow.camera.bottom=-170;sun.shadow.bias=-.0003;scene.add(sun);
const material=(c:number)=>new THREE.MeshLambertMaterial({color:c});
const grass=material(0x7aa46d),asphalt=material(0x656b6c),stone=material(0xb7b2a5),white=material(0xe9e1c8);
function box(w:number,h:number,d:number,m:THREE.Material,x:number,y:number,z:number){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;scene.add(o);return o}
let seed=12345;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}function between(a:number,b:number){return a+(b-a)*rand()}
let seed=12345;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}function between(a:number,b:number){return a+(b-a)*rand()}
// The procedural city has been removed. Real Kampen data is required.
const roadsX:number[]=[],roadsZ:number[]=[];
const loading=document.createElement('div');
loading.id='map-status';loading.setAttribute('role','status');
loading.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#152c3de8;color:white;padding:22px 28px;border-radius:12px;z-index:30;text-align:center;font:600 18px Arial;max-width:90vw';
loading.textContent='Echte kaart van Kampen laden…';document.body.append(loading);
function car(c:number,x:number,z:number){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(3,1.2,5.5),material(c));b.position.y=1.2;g.add(b);const top=new THREE.Mesh(new THREE.BoxGeometry(2.5,1,2.8),material(0x95c2cc));top.position.set(0,2.1,-.3);g.add(top);for(const a of [-1.4,1.4])for(const b of [-1.8,1.8]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.3,10),material(0x202429));wheel.rotation.z=Math.PI/2;wheel.position.set(a,.7,b);g.add(wheel)}g.position.set(x,.3,z);scene.add(g);return g}
const generatedWorld:THREE.Object3D[]=[];
let osmLoaded=false;
let osmFailed=false;
let osmMapWays:OsmWay[]=[];
let miniFrame=0;
const player=car(0xf5d125,0,0);let heading=0,speed=0,driving=true;const playerVehicles:THREE.Group[]=[];playerVehicles.push(player);
const pedestrian=new THREE.Group();const torso=new THREE.Mesh(new THREE.CylinderGeometry(.6,.7,1.7,6),material(0x4d79a3));torso.position.y=1.5;pedestrian.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.48,8,6),material(0xe7b88b));head.position.y=2.8;pedestrian.add(head);pedestrian.visible=false;scene.add(pedestrian);
const traffic:Array<{o:THREE.Group;axis:number;dir:number;v:number}>=[];for(let i=0;i<22;i++){const axis=i%2,dir=i%4<2?1:-1,x=axis?between(-140,140):roadsX[Math.floor(rand()*roadsX.length)]+dir*2,z=axis?roadsZ[Math.floor(rand()*roadsZ.length)]-dir*2:between(-110,110);const o=car([0xce4e40,0x4681a5,0xe9e4d6,0x424d50][i%4],x,z);o.rotation.y=axis?(dir>0?Math.PI/2:-Math.PI/2):(dir>0?0:Math.PI);traffic.push({o,axis,dir,v:between(5,12)});playerVehicles.push(o)}
const keys=new Set<string>();addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();keys.add(key);if((key==='e'||key==='f')&&!e.repeat)toggle()});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(b=>{const k=b.dataset.key!;b.addEventListener('pointerdown',e=>{b.setPointerCapture(e.pointerId);keys.add(k)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(k))});document.querySelector('#act')?.addEventListener('click',toggle);
function toggle(){
if(driving){driving=false;pedestrian.visible=true;pedestrian.position.copy(player.position).add(new THREE.Vector3(4,0,0));pedestrian.position.y=.3;speed=0;document.querySelector('#place')!.textContent='Te voet · E/F: instappen'}
else{let best:THREE.Group|null=null,dist=8;for(const vehicle of playerVehicles){const d=pedestrian.position.distanceTo(vehicle.position);if(d<dist){dist=d;best=vehicle}}
if(best){if(best!==player){const old=player.position.clone(),angle=player.rotation.y;player.position.copy(best.position);player.rotation.y=best.rotation.y;best.position.copy(old);best.rotation.y=angle;const entry=traffic.find(t=>t.o===best);if(entry){entry.o=player;entry.v=0}}driving=true;pedestrian.visible=false;speed=0;heading=player.rotation.y}}
}
const mini=document.querySelector<HTMLCanvasElement>('#mini')!.getContext('2d')!;const clock=new THREE.Clock();let time=0;
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);time+=dt;const up=keys.has('w')||keys.has('arrowup'),down=keys.has('s')||keys.has('arrowdown'),left=keys.has('a')||keys.has('arrowleft'),right=keys.has('d')||keys.has('arrowright');const target=driving?player:pedestrian;
if(driving){if(up)speed+=22*dt;if(down)speed-=18*dt;if(!up&&!down)speed*=Math.pow(.94,dt*60);if(keys.has(' '))speed*=Math.pow(.8,dt*60);speed=THREE.MathUtils.clamp(speed,-12,28);if(Math.abs(speed)>.2)heading+=(Number(left)-Number(right))*dt*1.8*Math.sign(speed);player.rotation.y=heading;player.position.x-=Math.sin(heading)*speed*dt;player.position.z-=Math.cos(heading)*speed*dt}else{const dx=Number(right)-Number(left),dz=Number(down)-Number(up),len=Math.hypot(dx,dz)||1;pedestrian.position.x+=dx/len*8*dt;pedestrian.position.z+=dz/len*8*dt}
target.position.x=THREE.MathUtils.clamp(target.position.x,-1600,3500);target.position.z=THREE.MathUtils.clamp(target.position.z,-2300,2300);
for(const t of traffic){if(t.v===0)continue;if(t.axis){t.o.position.x+=t.dir*t.v*dt;if(Math.abs(t.o.position.x)>145)t.o.position.x*=-1}else{t.o.position.z+=t.dir*t.v*dt;if(Math.abs(t.o.position.z)>120)t.o.position.z*=-1}}
camera.position.lerp(new THREE.Vector3(target.position.x+95,180,target.position.z+155),Math.min(1,dt*3));camera.lookAt(target.position.x,0,target.position.z);document.querySelector('#place')!.textContent=osmFailed?'OpenStreetMap niet bereikbaar · DEMOKAART':driving?'Kampen · Auto · E/F: uitstappen':'Kampen · Te voet · E/F: instappen';document.querySelector('#clock')!.textContent='12:'+String(Math.floor(time)%60).padStart(2,'0');
if(osmLoaded&&++miniFrame%8!==0){renderer.render(scene,camera);return}mini.clearRect(0,0,240,240);if(osmLoaded){mini.fillStyle='#a0b889';mini.fillRect(0,0,240,240);const mx=(x:number)=>120+(x-target.position.x)*.25,mz=(z:number)=>120+(z-target.position.z)*.25;for(const way of osmMapWays){if(!way.geometry||!way.tags)continue;const isRoad=!!way.tags.highway,isWater=way.tags.natural==='water'||!!way.tags.waterway;if(!isRoad&&!isWater)continue;mini.beginPath();way.geometry.forEach((p,i)=>{const v=project(p);if(i===0)mini.moveTo(mx(v.x),mz(v.y));else mini.lineTo(mx(v.x),mz(v.y))});mini.strokeStyle=isWater?'#347eab':'#686c70';mini.lineWidth=isWater?8:2;mini.stroke()}mini.fillStyle='#fce14b';mini.beginPath();mini.arc(120,120,5,0,Math.PI*2);mini.fill();renderer.render(scene,camera);return}mini.fillStyle='#283e46';mini.fillRect(0,0,240,240);renderer.render(scene,camera)}frame();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

/* Real Kampen map: roads, water and building outlines from OpenStreetMap.
   Download once at runtime; procedural scene stays as fallback if the service is unavailable. */
type OsmPoint={lat:number;lon:number};
type OsmWay={type:string;tags?:Record<string,string>;geometry?:OsmPoint[]};
// Origin taken from the Kampen OpenStreetMap link; distances are in metres.
const origin={lat:52.556,lon:5.915};
const metresPerDegreeLatitude=111132;
const metresPerDegreeLongitude=111320*Math.cos(origin.lat*Math.PI/180);
function project(p:OsmPoint){return new THREE.Vector2((p.lon-origin.lon)*metresPerDegreeLongitude,(origin.lat-p.lat)*metresPerDegreeLatitude)}
function ribbon(points:THREE.Vector2[],width:number,mat:THREE.Material,y:number){
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=a.distanceTo(b);if(len<.01)continue;const o=new THREE.Mesh(new THREE.PlaneGeometry(width,len),new THREE.MeshBasicMaterial({color:(mat as THREE.MeshLambertMaterial).color,side:THREE.DoubleSide}));o.rotation.set(-Math.PI/2,0,-Math.atan2(b.x-a.x,b.y-a.y),'YXZ');o.position.set((a.x+b.x)/2,y,(a.y+b.y)/2);scene.add(o)}
}
function osmPolygon(points:THREE.Vector2[],height:number,mat:THREE.Material,y=0){
 if(points.length<3)return;const shape=new THREE.Shape();shape.moveTo(points[0].x,-points[0].y);for(const p of points.slice(1))shape.lineTo(p.x,-p.y);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});geo.rotateX(-Math.PI/2);
 const mesh=new THREE.Mesh(geo,mat);mesh.position.y=y;mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
}
async function loadKampen(){
 const query='[out:json][timeout:35];(way(52.549,5.895,52.563,5.933)[highway];way(52.549,5.895,52.563,5.933)[building];way(52.549,5.895,52.563,5.933)[waterway];way(52.549,5.895,52.563,5.933)[natural=water];way(52.549,5.895,52.563,5.933)[landuse=basin];);out geom;';
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),45000);
 try{
  let data:{elements:OsmWay[]}|undefined;
  for(const endpoint of ['https://overpass.private.coffee/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass-api.de/api/interpreter']){
   try{const response=await fetch(endpoint,{method:'POST',body:'data='+encodeURIComponent(query),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:controller.signal});if(!response.ok)throw Error('Overpass HTTP '+response.status);data=await response.json() as {elements:OsmWay[]};if(data.elements?.length)break}catch(e){console.warn('OSM endpoint failed',endpoint,e)}
  }
  if(!data?.elements?.length)throw Error('No OpenStreetMap response');
  const ways=data.elements.filter(w=>w.geometry&&w.geometry.length>1);
  if(ways.length<50)throw Error('Insufficient OSM data');
  osmMapWays=ways;osmLoaded=true;loading.remove();
  for(const obj of generatedWorld)scene.remove(obj); // Keep player, pedestrians and traffic: they were created after this snapshot.
  box(3600,.2,2800,grass,0,-.1,0);
  const road=material(0x63676c),river=material(0x3988a7),buildingMats=[material(0xd5aa86),material(0xe7d1af),material(0xba8b72)];
  for(const way of ways){const pts=way.geometry!.map(project);
   if(way.tags?.natural==='water'||way.tags?.landuse==='basin')osmPolygon(pts,.06,river,.05);
   else if(way.tags?.waterway)ribbon(pts,way.tags.waterway==='river'?18:5,river,.08);
   else if(way.tags?.highway){const category=way.tags.highway;const width=['primary','secondary','tertiary','trunk'].includes(category)?8:['footway','path','pedestrian','cycleway'].includes(category)?2.2:5;ribbon(pts,width,road,.13);if(pts.length<80)for(let i=1;i<pts.length;i++)decorateRoad(scene,pts[i-1],pts[i],width)}
   else if(way.tags?.building){const floors=Number(way.tags['building:levels']);const height=Number.isFinite(floors)&&floors>0?Math.min(30,floors*3.3):between(7,17);osmPolygon(pts,height,buildingMats[Math.floor(rand()*buildingMats.length)]);void height}
  }
  // Spawn near the Kampen city centre, not at an arbitrary origin.
  const start=project({lat:52.556,lon:5.915});player.position.set(start.x,.3,start.y);
  const roads=ways.filter(w=>w.tags?.highway&&w.geometry&&w.geometry.length>1);
  for(const t of traffic){const way=roads[Math.floor(rand()*roads.length)];if(!way)continue;const a=project(way.geometry![0]),b=project(way.geometry![1]);t.o.position.set(a.x,.3,a.y);t.o.rotation.y=-Math.atan2(b.x-a.x,b.y-a.y);t.v=0}
  document.querySelector('#place')!.textContent='Kampen · OpenStreetMap';
 }catch(err){osmFailed=true;console.error('OSM unavailable',err);loading.textContent='De kaart van Kampen kon niet worden geladen. Vernieuw de pagina om opnieuw te proberen.';document.querySelector('#place')!.textContent='OpenStreetMap niet bereikbaar';}
 finally{clearTimeout(timeout)}
}
void loadKampen();
