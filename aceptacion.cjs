/* Study Hub 1.1: pruebas de aceptación sobre Chromium real.
   Cámara/micrófono usan dispositivos EMULADOS; OCR y traducción son reales.
   No modifica el código de la aplicación para producir resultados correctos. */
const fs=require('fs'),path=require('path'),puppeteer=require('puppeteer'),acorn=require('acorn');
const parent=path.resolve(__dirname,'..');
const ROOT=fs.existsSync(path.join(parent,'index.html'))?parent:path.resolve(__dirname,'../study-hub'),URL='http://localhost:8123/index.html';
const checks=[],errors=[],requests=[];let browser,page;
function check(name,ok,detail=''){checks.push({name,ok:!!ok,detail:String(detail)});console.log((ok?'✓ ':'✗ ')+name+(detail?' · '+String(detail).slice(0,140):''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ev=fn=>page.evaluate(fn);
const val=s=>page.$eval(s,e=>e.value);
const txt=s=>page.$eval(s,e=>e.textContent);
async function route(tool){await page.evaluate(id=>StudyHub.go(id),tool);await sleep(180);}
async function click(selector){await page.waitForSelector(selector,{visible:true});await page.click(selector);await sleep(30);}
async function input(selector,value){await page.$eval(selector,(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},value);}
async function wait(condition){await page.waitForFunction(condition,{timeout:15000});}
async function drag(x1,y,x2){
 const client=await page.createCDPSession();await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y}]});
 for(let i=1;i<=9;i++){const x=x1+(x2-x1)*i/9;await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});}
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(320);await client.detach();
}
async function main(){
 const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'),js=html.split('<script>')[1].split('</script>')[0],ast=acorn.parse(js,{ecmaVersion:'latest'});
 const calls=[];function walk(n){if(!n||typeof n!=='object')return;if((n.type==='CallExpression'&&n.callee?.name==='eval')||(n.type==='NewExpression'&&n.callee?.name==='Function'))calls.push(n.type);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}walk(ast);
 check('JavaScript válido; no llamadas a eval ni new Function',calls.length===0);
 check('Sin URLs de servicios de IA/traducción neuronal',!/(api\.openai|anthropic\.com|translate\.googleapis|lingva\.|libretranslate)/i.test(js));
 for(const lang of ['spa','eng']){const data=require('zlib').gunzipSync(fs.readFileSync(path.join(ROOT,'assets/ocr/langs/'+lang+'.traineddata.gz')));check('Datos '+lang+' sin componentes LSTM',[17,18,19,20,21,22].every(i=>data.readBigInt64LE(4+i*8)<0));}
 check('PWA: manifest, worker e iconos existen',['manifest.webmanifest','sw.js','icons/icon-192.png','icons/icon-512.png'].every(f=>fs.existsSync(path.join(ROOT,f))));
 browser=await puppeteer.launch({headless:true,protocolTimeout:240000,args:['--no-sandbox','--disable-setuid-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
 page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await page.emulateTimezone('Europe/Madrid');
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({url:r.url(),body:r.postData()||''}));
 await page.goto(URL,{waitUntil:'load'});await ev(()=>window.studyHubReady);await sleep(350);
 check('Arranque en Inicio con IndexedDB',await ev(()=>StudyHub.current==='home'&&StudyHub.DB.available));
 check('No envía solicitudes externas al abrir',requests.every(r=>r.url.startsWith('http://localhost:8123/')||r.url.startsWith('data:')));
 check('Sin datos de ejemplo inventados',await ev(()=>StudyHub.Notes.cache.length===0&&StudyHub.Events.cache.length===0&&StudyHub.Files.cache.length===0));
 check('Orden de las 11 herramientas',await page.$$eval('.nav-item',a=>a.map(e=>e.dataset.tool).join(','))==='home,calculator,scanner,translator,notes,calendar,files,recorder,search,tts,settings');
 for(const tool of ['calculator','notes','calendar','files','recorder','tts','scanner','translator','search','settings','home']){
  await route(tool);check('Navegación sin recarga: '+tool,await ev(()=>document.querySelector('.view.active').id==='view-'+StudyHub.current));
 }
 let hb=await page.$eval('#grabHandle',e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});
 await drag(hb.x,hb.y,240);
 check('Arrastrar rayita abre el menú completamente',await ev(()=>document.body.classList.contains('drawer-open')&&Math.abs(document.querySelector('#drawer').getBoundingClientRect().left)<1));
 hb=await page.$eval('#grabHandle',e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});
 check('La rayita sigue visible en el menú abierto',hb.x>200&&hb.x<350);
 await drag(hb.x,hb.y,12);
 check('Arrastrar la misma rayita al borde cierra el menú',await ev(()=>!document.body.classList.contains('drawer-open')&&document.querySelector('#drawer').inert));
 await click('#menuBtn');await sleep(280);await page.touchscreen.tap(380,140);await sleep(300);
 check('Toque fuera del menú lo cierra',await ev(()=>!document.body.classList.contains('drawer-open')));
 await click('#menuBtn');await sleep(250);await click('.nav-item[data-tool="notes"]');await sleep(280);
 check('Herramienta seleccionada señalada y menú cerrado',await ev(()=>StudyHub.current==='notes'&&document.querySelector('.nav-item[data-tool="notes"]').getAttribute('aria-current')==='page'&&!document.body.classList.contains('drawer-open')));
 // Cancelar diálogos no deja promesas pendientes.
 await ev(()=>{window.__cancelled='pending';StudyHub.promptDialog('Cancelar','Texto','x').then(v=>window.__cancelled=v);});await sleep(120);await page.keyboard.press('Escape');await wait(()=>window.__cancelled===null);
 check('Cancelar prompt por Escape resuelve su promesa',await ev(()=>window.__cancelled===null));
 // Matemática con resultados exactos y entradas inválidas.
 const math=[['1+2*3',7],['(1+2)*3',9],['-5+3',-2],['-2^2',-4],['2^3^2',512],['2*-3',-6],['0.1+0.2',.3],['3,5+1,5',5],['3(4)',12],['2pi',2*Math.PI],['sqrt(16)',4],['sin(30)',.5],['log(1000)',3],['ln(e)',1],['5!',120],['200+10%',220],['200-10%',180],['200*10%',20],['25%',.25],['1/2+1/3',5/6],['1e-5*10',.0001]];
 for(const [expr,want] of math){const r=await page.evaluate(expr=>StudyHub.MathCore.evaluate(expr,'DEG'),expr);check('Cálculo '+expr,r.ok&&Math.abs(r.value-want)<1e-9,r.ok?r.value:r.error);}
 for(const expr of ['1/0','sqrt(-4)','1+','(2+3','1.2.3','1 2','2+*3','alert(1)','document.cookie','tan(90)','50%20']){const r=await page.evaluate(expr=>StudyHub.MathCore.evaluate(expr,'DEG'),expr);check('Rechaza entrada inválida '+expr,!r.ok,r.error);}
 check('Fracción exacta 0,75 = 3/4',await ev(()=>StudyHub.MathCore.fmtFraction(StudyHub.MathCore.fraction(.75)))==='3/4');
 await route('calculator');
 for(const key of ['AC','5','−','3','±','='])await click('#calcKeys [data-k="'+key+'"]');
 check('Cambio de signo de operando sin concatenar dígitos',(await txt('#calcRes'))==='8',await txt('#calcRes'));
 await click('#calcSeg [data-mode="frac"]');for(const key of ['AC','1','a/b','2','+','1','a/b','3','='])await click('#calcKeys [data-k="'+key+'"]');
 check('Modo fracciones: 1/2+1/3=5/6',(await txt('#calcRes'))==='5/6');
 for(const key of ['+','1','='])await click('#calcKeys [data-k="'+key+'"]');
 check('Encadenar un resultado fraccionario conserva su valor',await ev(()=>Math.abs(StudyHub.Calc.value-11/6)<1e-9),await txt('#calcRes'));
 await click('#calcSeg [data-mode="sci"]');for(const key of ['AC','sin','3','0','='])await click('#calcKeys [data-k="'+key+'"]');
 check('Tecla sin y autocierre de paréntesis',(await txt('#calcRes'))==='0.5');
 await click('#calcAngle');for(const key of ['AC','sin','0','='])await click('#calcKeys [data-k="'+key+'"]');check('Modo RAD',(await txt('#calcRes'))==='0');await click('#calcAngle');
 check('Historial conserva resultado numérico',await ev(()=>StudyHub.state.calcHistory.every(h=>Number.isFinite(h.value))));
 await click('#headActions button');await sleep(130);check('Botón de historial real abre diálogo',(await txt('#modalTitle'))==='Historial');await click('#modalClose');
 // Notas por interfaz, autoguardado, etiquetas, papelera, rechazo de escritura.
 await route('notes');await click('#newNoteBtn');await input('#neTitle','Física · tema 1');await input('#neBody','Ley de Ohm: V = I × R.\n<svg onload="window.__xss=true"></svg>');await input('#neSubject','Física');await input('#neTags','repaso, fórmulas');await click('#neColors [data-c="#d6ecff"]');await click('#nePin');await click('#modalClose');
 await wait(()=>StudyHub.Notes.cache.some(n=>n.title==='Física · tema 1'));await ev(()=>StudyHub.NotesEditor.flush());
 check('Guardar al cerrar inmediatamente, con asignatura, etiquetas y color',await ev(()=>{const n=StudyHub.Notes.cache[0];return n.subject==='Física'&&n.tags.includes('repaso')&&n.pinned&&n.color==='#d6ecff';}),JSON.stringify(await ev(()=>StudyHub.Notes.cache[0])));
 check('La nota no ejecuta el HTML escrito',await ev(()=>!window.__xss&&!document.querySelector('#notesGrid svg[onload]')));
 await input('#noteSearch','fórmulas');check('Buscar por etiqueta',await page.$$eval('#notesGrid [data-card]',a=>a.length)===1);await input('#noteSearch','');
 await ev(()=>StudyHub.NotesEditor.open(StudyHub.Notes.cache[0].id));await sleep(140);await input('#neBody','V = I × R; P = V × I');await sleep(650);
 check('Autoguardado confirmado en IndexedDB',await ev(async()=>{const n=await StudyHub.DB.get('notes',StudyHub.Notes.cache[0].id);return n.body.includes('P = V');}));
 await click('#neDelete');await sleep(200);await click('#noteTabs [data-tab="trash"]');
 check('Nota eliminada recuperable en papelera',await ev(()=>StudyHub.Notes.cache[0].deleted)&&await page.$$eval('#notesGrid [data-card]',a=>a.length)===1);
 await click('#notesGrid [data-card]');await sleep(140);await click('#neRestore');await sleep(200);
 check('Recuperación real de nota',await ev(()=>!StudyHub.Notes.cache[0].deleted));
 await click('#noteTabs [data-tab="all"]');await click('#notesGrid [data-card]');await sleep(130);await click('#neTts');await sleep(120);
 check('Enviar nota al lector conserva el texto',(await val('#ttsText')).includes('P = V × I'));
 // Error de almacenamiento: no publicar un 'Guardado' inventado.
 const failure=await ev(async()=>{const put=StudyHub.DB.put.bind(StudyHub.DB),before=StudyHub.Notes.cache.length;StudyHub.DB.put=async()=>{throw new DOMException('Cuota simulada','QuotaExceededError');};let rejected=false;try{await StudyHub.Notes.save({id:'quota_test',title:'No guardar',body:'x',color:'#ffffff'});}catch(e){rejected=true;}finally{StudyHub.DB.put=put;}return rejected&&StudyHub.Notes.cache.length===before;});
 check('Error de cuota no crea una nota falsamente guardada',failure);
 // Calendario civil y editor sin perder asignatura.
 await route('calendar');await click('#newEventBtn');await input('#eeTitle','Examen de química');await input('#eeSubject','Química');await input('#eeDesc','Temas 1 a 4');await click('#eeTypes [data-t="exam"]');await click('#eeSave');await sleep(200);
 check('Evento real creado con asignatura',await ev(()=>StudyHub.Events.cache.some(e=>e.title==='Examen de química'&&e.subject==='Química'&&e.type==='exam')));
 check('Vista mensual de 42 días',await page.$$eval('#calMonth .cal-cell',a=>a.length)===42);
 await click('#calSeg [data-cv="week"]');check('Vista semanal de 7 días',await page.$$eval('#calWeek .week-row',a=>a.length)===7);
 await click('#calSeg [data-cv="day"]');check('Vista diaria',await page.$$eval('#calWeek .week-row',a=>a.length)===1);
 const dst=await ev(()=>{StudyHub.state.calView='month';StudyHub.Cal.cursor=new Date(2026,9,1);StudyHub.Cal.render();return [...document.querySelectorAll('#calMonth [data-d]')].map(e=>new Date(e.dataset.d).toLocaleDateString('sv-SE'));});
 check('Calendario correcto al cambiar la hora en octubre',new Set(dst).size===42&&dst.includes('2026-10-25')&&dst.includes('2026-10-26'));
 await ev(async()=>{const d=new Date();d.setDate(d.getDate()-20);await StudyHub.Events.save({id:'overdue',title:'Deber pendiente atrasado',type:'homework',subject:'Mates',desc:'',date:d.toISOString(),done:false,remind:false,updated:Date.now()});});await route('home');
 check('Inicio incluye tareas antiguas aún pendientes',(await txt('#homeTasks')).includes('Deber pendiente atrasado'));
 await click('#homeTasks [data-tick="overdue"]');await sleep(130);check('Completar tarea actualiza el Inicio',(await txt('#homeTasks')).includes('Deber pendiente atrasado')===false);
 // Archivos, carpetas, favoritos, papelera, lectura y transferencias.
 await route('files');await ev(async()=>{await StudyHub.Files.import([new File(['Ángulo y fuerza\nTexto local'],'apuntes.txt',{type:'text/plain'})]);});
 check('Archivo importado con datos y metadatos',await ev(()=>StudyHub.Files.cache[0].size>10&&StudyHub.Files.cache[0].blob instanceof Blob));
 await click('#newFolderBtn');await sleep(130);await input('#prInput','Matemáticas');await click('#modalBody [data-x="yes"]');await sleep(150);
 check('Carpeta virtual persistida en IndexedDB',await ev(async()=>{const meta=await StudyHub.DB.get('meta','folders');return meta.value.some(f=>f.name==='Matemáticas');}));
 await click('#filesGrid [data-fav]');await sleep(100);check('Favorito de archivo',await ev(()=>StudyHub.Files.cache[0].fav));
 await click('#filesGrid [data-fopen]');await wait(()=>!!document.querySelector('#pvText'));
 check('Lee texto real del archivo',(await val('#pvText')).includes('Texto local'));
 await click('#pvTts');await sleep(130);check('Archivo enviado al lector sin perder contenido',(await val('#ttsText')).includes('Ángulo y fuerza'));
 await route('files');await click('#filesGrid [data-fopen]');await wait(()=>!!document.querySelector('#pvMove'));await click('#pvMove');await sleep(150);await page.$$eval('#modalBody [data-i]',a=>a.find(el=>el.textContent.includes('Matemáticas')).click());await sleep(180);
 check('Mover archivo a carpeta virtual',await ev(()=>StudyHub.Files.cache[0].path===StudyHub.Files.folders.find(f=>f.name==='Matemáticas').id));
 await ev(()=>StudyHub.Files.cd(StudyHub.Files.cache[0].path));await click('#filesGrid [data-fdel]');await sleep(150);await click('#modalBody [data-x="yes"]');await sleep(150);
 check('Archivo en papelera',await ev(()=>StudyHub.Files.cache[0].deleted));await ev(()=>StudyHub.Files.showTrash());await sleep(150);await click('#modalBody [data-r]');await sleep(200);check('Recuperar archivo con binario intacto',await ev(async()=>!StudyHub.Files.cache[0].deleted&&(await StudyHub.Files.cache[0].blob.text()).includes('Texto local')));
 // Cámara emulada, bloqueo explícito, no permisos automáticos.
 await route('scanner');await click('#camBtn');await wait(()=>StudyHub.Scanner.camOn&&document.querySelector('#scanVideo').videoWidth>0);check('Cámara por getUserMedia (dispositivo emulado)',await ev(()=>StudyHub.Scanner.stream.getVideoTracks()[0].readyState==='live'));await click('#captureBtn');await wait(()=>StudyHub.Scanner.image instanceof Blob);
 check('Captura una foto real del stream y libera la cámara',await ev(()=>StudyHub.Scanner.image.size>0&&!StudyHub.Scanner.camOn&&StudyHub.Scanner.stream===null));
 await ev(async()=>{const orig=navigator.mediaDevices.getUserMedia;navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Permiso denegado','NotAllowedError');};await StudyHub.Scanner.startCamera();navigator.mediaDevices.getUserMedia=orig;});check('Cámara denegada: mensaje y app operativa',(await txt('#toasts')).includes('permiso de cámara'));
 await input('#ocrText','Ejercicio: 12 + 7\nPrueba: 5 * 8\nApuntes de ciencias.');await click('#ocrMath');check('Extrae operaciones con programación convencional',await page.$$eval('#ocrMathResults [data-m]',a=>a.length)===2);await click('#ocrMathResults [data-m]');check('Operación enviada a la calculadora',await ev(()=>StudyHub.current==='calculator'&&Math.abs(StudyHub.Calc.value-19)<1e-9));
 // MediaRecorder emulado: pausa excluida del tiempo, bytes de audio reales.
 await route('recorder');await click('#recBtn');await wait(()=>StudyHub.Rec.mr?.state==='recording');await sleep(300);await click('#recPause');const pauseAt=await ev(()=>StudyHub.Rec.duration());await sleep(600);check('Pausar congela el tiempo de grabación',Math.abs((await ev(()=>StudyHub.Rec.duration()))-pauseAt)<30);await click('#recPause');await sleep(300);await click('#recStop');await wait(()=>StudyHub.Rec.cache.length===1&&!StudyHub.Rec.pending);
 const recording=await ev(()=>({size:StudyHub.Rec.cache[0].size,duration:StudyHub.Rec.cache[0].duration,type:StudyHub.Rec.cache[0].type}));
 check('Audio real guardado y pausa excluida',recording.size>0&&recording.duration>=500&&recording.duration<1100,JSON.stringify(recording));
 check('Micrófono liberado al detener',await ev(()=>StudyHub.Rec.stream===null));await click('#recList [data-rplay]');await sleep(150);check('Reproducción del audio guardado',await page.$eval('#recList audio',a=>!!a.src&&!a.paused));await page.$eval('#recList audio',a=>a.pause());
 await click('#recList [data-rren]');await sleep(120);await input('#prInput','Clase de física');await click('#modalBody [data-x="yes"]');await sleep(150);check('Renombrar grabación persistente',await ev(async()=>{const r=await StudyHub.DB.get('recordings',StudyHub.Rec.cache[0].id);return r.name==='Clase de física';}));
 // Voz nativa: disponibilidad real y división de textos; no motor de voz propio.
 await route('tts');await sleep(350);const native=await ev(()=>({api:StudyHub.TTS.supported(),voices:StudyHub.TTS.allVoices.length,playDisabled:document.querySelector('#ttsPlay').disabled}));
 check('Disponibilidad de voces tratada sin inventarlas',native.api&&(native.voices>0||native.playDisabled),JSON.stringify(native));
 const chunks=await page.evaluate(()=>StudyHub.TTS.split('Texto largo sin puntuación '+('palabra '.repeat(150))+' X'.repeat(20)));
 check('Texto largo se divide en tramos cortos sin pérdida',chunks.every(s=>s.length<=220)&&chunks.join(' ').includes('palabra')&&chunks.length>3,chunks.length+' tramos');
 await page.$eval('#ttsRate',e=>{e.value='1.5';e.dispatchEvent(new Event('input'));});check('Velocidad y ajustes de voz guardados',await ev(()=>StudyHub.state.ttsRate===1.5));await page.select('#ttsLanguage','zh-CN');await sleep(60);check('Aviso si falta una voz en el idioma elegido',await ev(()=>StudyHub.TTS.voices.length>0||!document.querySelector('#ttsWarn').classList.contains('hide')));
 await browser.defaultBrowserContext().overridePermissions('http://localhost:8123',['clipboard-read','clipboard-write','camera','microphone']);
 await route('calculator');await page.evaluate(()=>{StudyHub.Calc.expr='6*7';StudyHub.Calc.evaluate();});await click('#calcCopy');
 check('Copiar resultado al portapapeles real',await ev(()=>navigator.clipboard.readText())==='42');
 // Traducción real por reglas, memoria humana, parejas no instaladas.
 await route('translator');check('Siete idiomas y opción de origen automático',await page.$$eval('#trTo option',a=>a.length)===7&&await page.$$eval('#trFrom option',a=>a.length)===8);
 await input('#trInput','Buenos días.');await page.select('#trFrom','es');await page.select('#trTo','en');await page.select('#trService','apertium');await click('#trGo');await wait(()=>!StudyHub.Translator.busy);
 check('Apertium devuelve una traducción REAL por reglas',/good morning/i.test(await txt('#trOut'))&&/Apertium/.test(await txt('#trEngine')),await txt('#trOut'));
 await click('#trFav');check('Traducción en favoritos e historial',await ev(()=>StudyHub.state.trFavs.length===1&&StudyHub.state.trHistory.length>=1));
 await input('#trInput','Guten Morgen.');await page.select('#trFrom','de');await click('#trGo');await wait(()=>!StudyHub.Translator.busy);check('No inventa traducción para pareja no instalada',(await txt('#trOut')).trim()===''&&(await txt('#trStatus')).includes('pareja'));
 await page.select('#trService','memory');await page.select('#trFrom','es');await input('#trInput','buenos días');await click('#trGo');await wait(()=>!StudyHub.Translator.busy);check('Memoria humana con traducción automática desactivada',/good morning/i.test(await txt('#trOut'))&&requests.some(r=>r.url.includes('mymemory')&&r.url.includes('mt=0')),await txt('#trOut'));
 await input('#trInput','zqvzx frandulomás inexistente 739461');await click('#trGo');await wait(()=>!StudyHub.Translator.busy);check('Sin segmento humano exacto, no inventa resultado',(await txt('#trOut')).trim()==='');
 check('No solicita proveedores neuronales como alternativa',requests.every(r=>!/translate\.googleapis|lingva\.|openai|anthropic/.test(r.url)));
 // Buscador externo real y su historial, sin iframe de apariencia funcional.
 await route('search');await ev(()=>{window.__opened=[];window.open=(url)=>{window.__opened.push(url);return null;};});await input('#webQuery','fotosíntesis para estudiar');await click('#webGo');check('Abre URL real del motor, sin resultados inventados',await ev(()=>window.__opened.some(u=>u.includes('duckduckgo')&&u.includes('fotos%C3%ADntesis'))&&!document.querySelector('#view-search iframe')));check('Enlace de búsqueda visible e historial',await page.$eval('#webResult a',e=>e.target==='_blank'&&e.href.startsWith('https://'))&&await ev(()=>StudyHub.state.searchHistory.includes('fotosíntesis para estudiar')));
 // OCR REAL clásico sobre una imagen sintética, no respuestas prefabricadas.
 await route('scanner');await ev(async()=>{
  const c=document.createElement('canvas');c.width=1000;c.height=220;const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='black';ctx.font='bold 52px sans-serif';ctx.fillText('STUDY HUB 2026',30,80);ctx.font='44px sans-serif';ctx.fillText('12 + 7 = 19',30,155);const blob=await new Promise(r=>c.toBlob(r,'image/png'));await StudyHub.Scanner.setImage(blob);StudyHub.state.ocrLangs='eng';document.querySelector('#ocrLangs').value='eng';
  await StudyHub.Scanner.loadEngine();const original=Tesseract.createWorker;window.__ocrMode=null;Tesseract.createWorker=(langs,oem,opts)=>{window.__ocrMode={oem,legacyCore:opts.legacyCore,legacyLang:opts.legacyLang};return original(langs,oem,opts);};
 });
 await click('#ocrRun');await page.waitForFunction(()=>!StudyHub.Scanner.busy,{timeout:220000});
 const ocr=await val('#ocrText'),mode=await ev(()=>window.__ocrMode);
 check('Tesseract ejecutado en OEM 0 sin LSTM',mode?.oem===0&&mode.legacyCore&&mode.legacyLang,JSON.stringify(mode));
 check('OCR reconoce texto REAL de la imagen',/STUDY HUB/i.test(ocr)&&/2026/.test(ocr),JSON.stringify(ocr));
 await click('#ocrSaveNote');await sleep(150);check('Texto OCR guardado como nota real',await ev(()=>StudyHub.Notes.cache.some(n=>n.body.includes('STUDY HUB'))));
 await ev(async()=>{const c=document.createElement('canvas');c.width=1100;c.height=200;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,c.width,c.height);x.fillStyle='black';x.font='44px sans-serif';x.fillText('La energía y los átomos.',20,90);await StudyHub.Scanner.setImage(await new Promise(r=>c.toBlob(r)));StudyHub.state.ocrLangs='spa+eng';});
 await click('#ocrRun');await page.waitForFunction(()=>!StudyHub.Scanner.busy,{timeout:60000});
 check('OCR español e inglés con los datos clásicos incluidos',/energía.*átomos/i.test(await val('#ocrText')),await val('#ocrText'));
 // Preferencias, backups íntegros y validación sin pérdida de los originales.
 await route('settings');await sleep(150);check('Almacenamiento y permisos con estados reales',await page.$$eval('#storageBreakdown .storage-line',a=>a.length)===5&&await page.$$eval('#permList .set-row',a=>a.length)===4);
 await page.select('#setTheme','dark');check('Tema oscuro aplicado',await ev(()=>document.documentElement.dataset.theme==='dark'&&getComputedStyle(document.body).backgroundColor==='rgb(11, 15, 25)'));
 await page.select('#setSize','l');check('Tamaño de texto cambia también rem',await ev(()=>parseFloat(getComputedStyle(document.documentElement).fontSize)>16));await page.select('#setSize','m');await page.select('#setLang','en');check('Menú e interfaz en inglés',(await txt('#headTitle'))==='Settings');await page.select('#setLang','es');await page.select('#setTheme','light');
 const backup=await ev(async()=>{const data=await StudyHub.Backup.build();window.__backup=JSON.parse(JSON.stringify(data));const parsed=StudyHub.Backup.validate(data);return{files:parsed.records.files.length,audio:parsed.records.recordings.length,notes:parsed.records.notes.length,bytes:parsed.records.recordings[0].blob.size,sourceBytes:StudyHub.Rec.cache[0].size};});
 check('Copia completa contiene audio y archivos binarios',backup.files===1&&backup.audio===1&&backup.bytes===backup.sourceBytes,JSON.stringify(backup));
 const invalid=await ev(()=>{const before=StudyHub.Notes.cache.length,bad=structuredClone(window.__backup);bad.notes[0].color='red; background:url(https://example.com)';try{StudyHub.Backup.validate(bad);return false;}catch(e){return StudyHub.Notes.cache.length===before;}});
 check('Importación inválida se rechaza antes de borrar datos',invalid);
 const rollback=await ev(async()=>{const bad=StudyHub.Backup.validate(window.__backup).records;bad.notes.push({id:'unclonable',body:()=>1});const before=(await StudyHub.DB.all('notes')).length;let rejected=false;try{await StudyHub.DB.replaceAll(bad);}catch(e){rejected=true;}return rejected&&(await StudyHub.DB.all('notes')).length===before;});
 check('Transacción fallida revierte todo el reemplazo',rollback);
 await ev(async()=>{const parsed=StudyHub.Backup.validate(window.__backup);await StudyHub.Backup.apply(parsed);});
 check('Restauración real: notas, eventos, archivos y audio',await ev(()=>StudyHub.Notes.cache.length>=2&&StudyHub.Events.cache.length>=2&&StudyHub.Files.cache[0].blob instanceof Blob&&StudyHub.Rec.cache[0].name==='Clase de física'));
 const zip=await ev(async()=>Array.from(new Uint8Array(await StudyHub.makeTextZip([{name:'nota.txt',text:'Nota local áéí'}]).arrayBuffer())));
 fs.writeFileSync(path.join(__dirname,'notas-test.zip'),Buffer.from(zip));check('Exportación TXT en un ZIP local',zip[0]===80&&zip[1]===75&&zip.length>50);
 await page.reload({waitUntil:'load'});await ev(()=>window.studyHubReady);
 check('Datos y binarios persisten tras recargar',await ev(()=>StudyHub.Notes.cache.length>=2&&StudyHub.Events.cache.length>=2&&StudyHub.Rec.cache[0].blob instanceof Blob&&StudyHub.Files.cache[0].blob instanceof Blob));
 await ev(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>navigator.serviceWorker.controller);
 const offlineSessions=[];
 async function networkState(offline){
   for(const target of browser.targets())if(['page','service_worker'].includes(target.type())){
     const session=await target.createCDPSession();await session.send('Network.enable');
     await session.send('Network.emulateNetworkConditions',{offline,latency:0,downloadThroughput:offline?0:-1,uploadThroughput:offline?0:-1});
     await session.send('Network.overrideNetworkState',{offline,latency:0,downloadThroughput:offline?0:-1,uploadThroughput:offline?0:-1});offlineSessions.push(session);
   }
 }
 await networkState(true);const offlineResponse=await page.reload({waitUntil:'load'});await ev(()=>window.studyHubReady);
 // Chromium reinicia su override de navigator.onLine al navegar: aplicarlo al
 // nuevo documento; las peticiones del worker ya estaban bloqueadas durante la recarga.
 await networkState(true);
 check('Recarga atendida por el service worker con red bloqueada',offlineResponse.fromServiceWorker());
 check('PWA abre sin conexión y recupera datos locales',await ev(()=>!navigator.onLine&&StudyHub.DB.available&&StudyHub.Notes.cache.length>=2));
 await route('calculator');check('Calculadora funciona sin conexión',await ev(()=>StudyHub.MathCore.evaluate('2*(3+4)').value===14));await route('calendar');check('Calendario funciona sin conexión',await ev(()=>StudyHub.Events.cache.length>=2));await route('translator');await input('#trInput','Solo prueba sin conexión');await click('#trGo');check('Sin red, el traductor avisa y no promete traducción',(await txt('#toasts')).includes('Sin conexión'));
 await route('scanner');await ev(async()=>{
   const c=document.createElement('canvas');c.width=800;c.height=140;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,c.width,c.height);x.fillStyle='black';x.font='bold 48px sans-serif';x.fillText('OFFLINE STUDY HUB',20,90);await StudyHub.Scanner.setImage(await new Promise(r=>c.toBlob(r)));
 });await click('#ocrRun');await page.waitForFunction(()=>!StudyHub.Scanner.busy,{timeout:60000});
 check('OCR clásico funciona offline después de preparar sus recursos',/OFFLINE STUDY HUB/i.test(await val('#ocrText')),await val('#ocrText'));
 await networkState(false);for(const session of offlineSessions)await session.detach().catch(()=>{});await route('home');await sleep(300);await page.screenshot({path:path.join(__dirname,'final-home.png')});
 // Viewport reducido, escritorio y contraste de notas oscuras.
 for(const width of [360,768,1280]){await page.setViewport({width,height:900,deviceScaleFactor:1,isMobile:width<600,hasTouch:width<600});for(const tool of ['home','calendar','settings','notes','scanner','tts']){await route(tool);const noOverflow=await ev(()=>document.querySelector('.view.active').scrollWidth<=document.querySelector('#appBody').clientWidth+1);check('Sin desbordamiento '+width+'px · '+tool,noOverflow);}}
 await route('settings');await page.select('#setTheme','dark');await route('notes');const contrast=await page.$eval('#notesGrid .note-card',e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));check('Texto legible en notas con color bajo tema oscuro',contrast.fg==='rgb(32, 39, 56)',JSON.stringify(contrast));
 await ev(()=>StudyHub.closeDrawer());
 const mb=await page.$eval('#grabHandle',e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});
 await page.mouse.move(mb.x,mb.y);await page.mouse.down();await page.mouse.move(260,mb.y,{steps:12});await page.mouse.up();await sleep(300);
 check('Menú deslizable funciona también con ratón',await ev(()=>Math.abs(document.querySelector('#drawer').getBoundingClientRect().left)<1));
 await page.mouse.click(1250,120);await sleep(300);check('Cerrar menú con clic externo de ratón',await ev(()=>!document.body.classList.contains('drawer-open')));
 check('Sin excepciones JavaScript durante las pruebas',errors.length===0,JSON.stringify(errors));
 const report={date:new Date().toISOString(),version:'1.1.0',environment:'Chromium 148, viewport Android emulado; Europe/Madrid. Cámara/micrófono emulados. Traducción y OCR reales.',passed:checks.filter(c=>c.ok).length,failed:checks.filter(c=>!c.ok).length,checks,errors,requests};
 fs.writeFileSync(path.join(__dirname,'aceptacion-resultados.json'),JSON.stringify(report,null,2));
 console.log('\nRESULTADO: '+report.passed+' correctas; '+report.failed+' fallidas.');await browser.close();process.exitCode=report.failed?1:0;
}
main().catch(async e=>{console.error('FALLO DEL BANCO:',e);console.error('ERRORES DE APP:',errors);if(page)await page.screenshot({path:path.join(__dirname,'fallo.png')}).catch(()=>{});if(browser)await browser.close();process.exitCode=2;});
