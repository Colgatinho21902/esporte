const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {build}=require('../prepare-vercel.cjs');
function isolated(fn){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'helo-sport-build-'));
 const files=['config.json','index.template.html','app.js','style.css'];
 for(const file of files)fs.copyFileSync(path.join(__dirname,'..',file),path.join(dir,file));
 try{fn(dir);}finally{
  for(const file of ['dist/index.html','dist/config.js','dist/app.js','dist/style.css',...files])if(fs.existsSync(path.join(dir,file)))fs.unlinkSync(path.join(dir,file));
  if(fs.existsSync(path.join(dir,'dist')))fs.rmdirSync(path.join(dir,'dist'));
  fs.rmdirSync(dir);
 }
}
test('production resolves its actual Vercel hosts and preserves real Pixel and invitation',()=>isolated(dir=>{
 const config=build({VERCEL:'1',VERCEL_ENV:'production',VERCEL_PROJECT_PRODUCTION_URL:'esporte.example',VERCEL_URL:'esporte-abc.vercel.app',VERCEL_BRANCH_URL:'esporte-git-main.vercel.app'},dir);
 assert.equal(config.trackingEnabled,true);assert.equal(config.pixelId,'1042681992165459');
 assert.deepEqual(config.trackingHosts,['achadinhosesporte.vercel.app','esporte.example','esporte-abc.vercel.app','esporte-git-main.vercel.app']);
 const html=fs.readFileSync(path.join(dir,'dist/index.html'),'utf8');
 assert.equal((html.match(/id="ctaPrincipal"/g)||[]).length,1);
 assert.ok(html.includes('href="https://chat.whatsapp.com/DUNIFFzsCFt98ub8PohS8t"'));
 assert.ok(html.includes('https://esporte.example/assets/logo-verde-384.webp'));
 assert.equal(html.includes('{{'),false);
}));
test('preview remains disabled even when Vercel exposes the production domain',()=>isolated(dir=>{
 const config=build({VERCEL:'1',VERCEL_ENV:'preview',VERCEL_PROJECT_PRODUCTION_URL:'esporte.example',VERCEL_URL:'preview.vercel.app'},dir);
 assert.equal(config.trackingEnabled,false);assert.deepEqual(config.trackingHosts,[]);
}));
test('local build is disabled; missing production environment information fails clearly',()=>isolated(dir=>{
 assert.equal(build({},dir).trackingEnabled,false);
 assert.throws(()=>build({VERCEL:'1'},dir),/System Environment Variables/);
 assert.equal(build({VERCEL_ENV:'production'},dir).trackingHosts.includes('achadinhosesporte.vercel.app'),true);
}));
