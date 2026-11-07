const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const code=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function harness({url='https://chat.whatsapp.com/ABCDEFGHIJKLM1234567890',privacy={},throws=false,host='sport.example',pixel=true}={}){
 const calls=[],scripts=[],events={};let now=0,listener;
 const cta={href:'#',removeAttribute(){},addEventListener(name,fn){listener=fn;}},status={textContent:''};
 const context=vm.createContext({window:{HELO_SPORT_CONFIG:{groupUrl:url,pixelId:pixel?'123456789012345':'',trackingEnabled:pixel,trackingHosts:['sport.example'],conversionEvent:'Lead'},addEventListener(name,fn){events[name]=fn;},fbq:(...args)=>{if(throws)throw Error('blocked');calls.push(args);}},
  document:{getElementById:id=>id==='ctaPrincipal'?cta:status,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}},navigator:privacy,localStorage:{getItem:()=>privacy.denied?'denied':null},location:{hostname:host},Date:{now:()=>now},Math,URL,crypto:{randomUUID:()=>String(Math.random())}});
 vm.runInContext(code,context);
 return {calls,scripts,cta,status,events,context,click(){const e={prevented:false,preventDefault(){this.prevented=true;}};listener(e);return e;},advance(ms){now+=ms;}};
}
test('one PageView; one Lead on double click; later retry and BFCache return remain possible',()=>{
 const h=harness();assert.equal(h.calls.filter(x=>x[0]==='init').length,1);assert.equal(h.calls.filter(x=>x[2]==='PageView').length,1);
 assert.equal(h.calls.filter(x=>x[2]==='Lead').length,0);assert.equal(h.click().prevented,false);assert.equal(h.click().prevented,true);assert.equal(h.calls.filter(x=>x[2]==='Lead').length,1);
 h.advance(2600);assert.equal(h.click().prevented,false);assert.equal(h.calls.filter(x=>x[2]==='Lead').length,2);
 h.events.pageshow();h.click();assert.equal(h.calls.filter(x=>x[2]==='Lead').length,3);
 vm.runInContext(code,h.context);assert.equal(h.calls.filter(x=>x[0]==='init').length,1);
});
test('invalid or missing invitation never navigates or emits Lead',()=>{
 for(const url of ['', 'javascript:alert(1)','https://evil.example/ABCDEF123456','https://chat.whatsapp.com.evil.example/ABCDEF123456']){const h=harness({url});assert.equal(h.click().prevented,true);assert.equal(h.calls.filter(x=>x[2]==='Lead').length,0);}
});
test('Pixel failure, missing ID, saved refusal, GPC, DNT and localhost do not block invitation',()=>{
 for(const options of [{throws:true},{pixel:false},{privacy:{denied:true}},{privacy:{globalPrivacyControl:true}},{privacy:{doNotTrack:'1'}},{host:'127.0.0.1'}]){const h=harness(options);assert.equal(h.click().prevented,false);assert.match(h.cta.href,/chat.whatsapp.com/);assert.equal(h.calls.filter(x=>x[2]==='Lead').length,0);}
});
