/* global AFRAME */
AFRAME.registerComponent('lab', {
 init() {
  const scene=this.el, T=AFRAME.THREE;
  const make=(tag,attrs,parent=scene)=>{const el=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));parent.appendChild(el);return el;};
  const box=(p,s,c,extra={})=>make('a-box',{position:p,width:s[0],height:s[1],depth:s[2],color:c,...extra});
  const label=(value,p,width=3,parent=scene)=>make('a-text',{value,position:p,width,align:'center',color:'#e6edd9',font:'https://cdn.aframe.io/fonts/mozillavr.fnt'},parent);
  const target=(el,fn)=>{el.classList.add('target');el.addEventListener('click',fn);el.addEventListener('mouseenter',()=>el.setAttribute('material','emissive','#243c29'));el.addEventListener('mouseleave',()=>el.setAttribute('material','emissive','#000000'));return el;};
  let found=new Set(), sequence=[],won=false;
  box('0 -0.12 0',[8,.24,10],'#313b38');box('0 3.7 0',[8,.2,10],'#202b29');
  box('-4 1.8 0',[.2,3.8,10],'#35413c');box('4 1.8 0',[.2,3.8,10],'#35413c');box('0 1.8 -5',[8,3.8,.2],'#293c36');box('0 1.8 5',[8,3.8,.2],'#35413c');
  for(let z=-4;z<=4;z+=1){box(`0 .006 ${z}`,[8,.012,.018],'#52615a');}
  for(let x=-3;x<=3;x++){box(`${x} .006 0`,[.018,.012,10],'#52615a');}
  for(let x of [-3.8,3.8])for(let z of [-4,-1,2,4])box(`${x} 1.8 ${z}`,[.18,3.6,.22],'#192722');
  // Work bench and specimen, deliberately stylised and non-graphic.
  box('0 .85 -1.1',[1.6,.2,2.8],'#66706a');for(let x of [-.6,.6])for(let z of [-2.2,0])box(`${x} .4 ${z}`,[.13,.8,.13],'#202a29');
  box('0 1.1 -1.1',[.65,.35,1.25],'#4c6960');make('a-sphere',{position:'0 1.13 -2',radius:.26,color:'#8aab78'});
  for(let x of [-.48,.48])box(`${x} 1.07 -1.1`,[.2,.23,1.05],'#8aab78');for(let x of [-.2,.2])box(`${x} 1.08 -.15`,[.25,.25,.7],'#273f37');
  box('0 1.31 -1.4',[1.25,.06,.12],'#b7a988');box('0 1.31 -.6',[1.25,.06,.12],'#b7a988');
  for(let x of [-1.25,1.25]){make('a-cylinder',{position:`${x} 1.2 -2.8`,radius:.13,height:2.4,color:'#697f79'});for(let y of [1.6,1.85,2.1])make('a-torus',{position:`${x} ${y} -2.8`,rotation:'90 0 0',radius:.28,'radius-tubular':.045,color:'#bb9c65'});make('a-sphere',{position:`${x} 2.5 -2.8`,radius:.22,material:'color: #82d6a8; shader: flat'});}
  // Shelves, jars and a closed specimen drawer.
  box('-2.6 .85 -3.8',[2,.18,1],'#564b3b');for(let x of [-3.4,-1.8])box(`${x} .4 -3.8`,[.12,.8,.12],'#322e27');
  for(let y of [1.4,2.2]){box(`-2.6 ${y} -4.55`,[2,.1,.7],'#695b42');for(let x of [-3.2,-2.6,-2])make('a-cylinder',{position:`${x} ${y+.25} -4.5`,radius:.13,height:.4,material:'color: #72a49a; opacity: 0.7; transparent: true'});}
  const drawer=box('-2.6 1 -3.35',[.7,.28,.09],'#a08c63');
  box('2.7 .65 -3.8',[1.7,1.3,.9],'#273e36');
  const book=box('2.7 1.37 -3.7',[.6,.1,.5],'#9b5141',{rotation:'0 -15 0'});
  label('ARCHIVO DEL DOCTOR','2.7 1.8 -4.3',2);
  // All feedback is inside the 3D world, so no DOM overlay is needed in VR.
  box('0 2.5 -4.83',[3.3,1,.08],'#101e19');
  const message=label('DOS NOTAS OCULTAS\nInvestiga el cajon y el archivo.','0 2.55 -4.75',3);
  const progress=label('PISTAS 0 / 2','0 3.25 -4.7',2.6);
  const say=text=>message.setAttribute('value',text);
  const clue=(id,text)=>{found.add(id);progress.setAttribute('value',`PISTAS ${found.size} / 2`);say(text);};
  target(drawer,()=>{drawer.setAttribute('position','-2.6 1 -3.05');clue(1,'NOTA I\nLa LUNA inicia el experimento.\nEl RAYO debe ser el ultimo.');});
  target(book,()=>clue(2,'NOTA II\nEl SOL sigue a la LUNA.\nActiva los tres simbolos en orden.'));
  label('CAJON DE MUESTRAS','-2.6 1.65 -3.6',1.8);
  box('2.6 1 0',[1.7,1.8,.65],'#23352e');label('REANIMADOR','2.6 2.2 .35',2);
  const keys=['LUNA','SOL','RAYO'];
  keys.forEach((name,i)=>{const x=2.05+i*.55;const b=box(`${x} 1.45 .4`,[.43,.45,.16],['#778cbb','#bba15d','#76ae88'][i]);label(name,`${x} 1.45 .49`,.85);target(b,()=>{
   if(won)return;
   if(found.size<2){say('Faltan notas. Busca las dos pistas.');return;}
   sequence.push(name);
   if(sequence.some((v,j)=>v!==keys[j])){sequence=[];say('Secuencia incorrecta.\nVuelve a empezar con la primera tecla.');return;}
   say(`Secuencia: ${sequence.join(' - ')}`);
   if(sequence.length===3){won=true;door.setAttribute('animation','property: position; to: -1.4 1.3 4.83; dur: 1800');say('EXPERIMENTO COMPLETADO\nLa salida esta abierta.');exitLabel.setAttribute('value','SALIDA ABIERTA');scene.setAttribute('background','color','#18352a');}
  });});
  const door=box('0 1.3 4.83',[1.7,2.6,.15],'#695c42');
  const exitLabel=label('SALIDA BLOQUEADA','0 2.95 4.7',2.3);exitLabel.setAttribute('rotation','0 180 0');
  // Teleport only between clear stations; preserve head height and orientation.
  for(const [x,z] of [[0,2.5],[-2,0],[2,2],[-2.4,-2.2],[2.4,-2.1],[0,3.8]]){
   const pad=make('a-cylinder',{position:`${x} .025 ${z}`,radius:.33,height:.035,color:'#658f79'});
   target(pad,()=>{const rig=document.getElementById('rig'),cam=document.getElementById('camera');const pos=new T.Vector3();cam.object3D.getWorldPosition(pos);rig.object3D.position.x+=x-pos.x;rig.object3D.position.z+=z-pos.z;});
  }
  label('EL ULTIMO EXPERIMENTO','0 3.25 -3',4);
 }
});
window.addEventListener('DOMContentLoaded',()=>{
 const scene=document.querySelector('a-scene'),intro=document.getElementById('intro'),status=document.getElementById('status');
 document.getElementById('desktop').onclick=()=>intro.hidden=true;
 document.getElementById('start').onclick=async()=>{try{if(!window.isSecureContext||!navigator.xr||!await navigator.xr.isSessionSupported('immersive-vr'))throw Error('Abre la URL HTTPS en Meta Quest Browser.');if(!scene.hasLoaded)throw Error('El laboratorio esta cargando. Prueba en unos segundos.');await scene.enterVR();intro.hidden=true;}catch(e){status.textContent=e.message;}};
 scene.addEventListener('exit-vr',()=>intro.hidden=false);
});
