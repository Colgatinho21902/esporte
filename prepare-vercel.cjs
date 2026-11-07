'use strict';
const fs = require('node:fs');
const path = require('node:path');
function build(env = process.env, root = __dirname) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
  const invitation = new URL(config.groupUrl);
  if (invitation.protocol !== 'https:' || invitation.hostname !== 'chat.whatsapp.com' || invitation.username || invitation.password || !/^\/[A-Za-z0-9]{10,}\/?$/.test(invitation.pathname)) throw new Error('Convite do WhatsApp inválido.');
  if (!/^\d{10,20}$/.test(config.pixelId)) throw new Error('ID de Pixel inválido.');
  if (env.VERCEL === '1' && !env.VERCEL_ENV) throw new Error('Ative o acesso às System Environment Variables na Vercel.');
  const production = env.VERCEL_ENV === 'production';
  const hosts = [env.VERCEL_PROJECT_PRODUCTION_URL, env.VERCEL_URL, env.VERCEL_BRANCH_URL].filter(Boolean);
  if (production && !hosts.length) throw new Error('Domínio de produção não informado pela Vercel.');
  config.trackingEnabled = config.trackingEnabled === true && production;
  config.trackingHosts = production ? [...new Set(hosts.map(host => {
    if (!/^[a-zA-Z0-9.-]+$/.test(host)) throw new Error('Domínio inválido.');
    return host.toLowerCase();
  }))] : [];
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const fields = Object.fromEntries(Object.entries(config).filter(([,v])=>typeof v === 'string').map(([k,v])=>[k,escape(v)]));
  for (const [key, value] of Object.entries(config.theme)) {
    if (!/^#[a-fA-F0-9]{6}$/.test(value)) throw new Error('Cor inválida.');
    fields[key] = value;
  }
  const icons = ['<path d="m3 6 4 3 4 1 2-4 3 5 3 1 2 3-1 2H3L2 14 3 6Zm-1 8h19M8 10l-1 3m4-2-1 3"/>','<path d="M6 3h8v4l2 2v10H4V9l2-2V3Zm0 4h8M4 11h12M4 16h12M7 3v2m4-2v2"/>','<path d="M3 7v6m3-8v10m8-10v10m3-8v6M6 10h8"/>'];
  if (config.categories.length > 3) throw new Error('Use até três categorias.');
  fields.categories = config.categories.map((label,i)=>'<li><svg viewBox="0 0 20 20" aria-hidden="true">'+icons[i]+'</svg>'+escape(label)+'</li>').join('');
  fields.ctaAttributes = 'href="'+escape(config.groupUrl)+'"';
  fields.status = 'Abrir convite no WhatsApp';
  let html = fs.readFileSync(path.join(root,'index.template.html'),'utf8');
  for (const [key,value] of Object.entries(fields)) html=html.replaceAll('{{'+key+'}}',value);
  if (html.includes('{{')) throw new Error('Campo não preenchido no HTML.');
  const productionHost = env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) html=html.replace('<meta property="og:type" content="website">','<meta property="og:type" content="website"><meta property="og:image" content="https://'+escape(productionHost)+escape(config.logo)+'">');
  fs.mkdirSync(path.join(root,'dist'),{recursive:true});
  fs.writeFileSync(path.join(root,'dist/index.html'),html);
  fs.writeFileSync(path.join(root,'dist/config.js'),'window.HELO_SPORT_CONFIG = Object.freeze('+JSON.stringify(config)+');\n');
  for (const name of ['app.js','style.css']) fs.copyFileSync(path.join(root,name),path.join(root,'dist',name));
  return config;
}
module.exports={build};
if (require.main === module) {
  const config=build();
  console.log(JSON.stringify({pixelId:config.pixelId,trackingEnabled:config.trackingEnabled,productionHosts:config.trackingHosts}));
}
