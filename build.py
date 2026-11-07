from pathlib import Path
from html import escape
from urllib.parse import urlparse
import json,re,shutil
ROOT=Path(__file__).resolve().parent
config=json.loads((ROOT/'config.json').read_text(encoding='utf-8'))
def valid_url(value):
    url=urlparse(value)
    return url.scheme=='https' and url.hostname=='chat.whatsapp.com' and not url.username and not url.password and bool(re.fullmatch(r'/[A-Za-z0-9]{10,}/?',url.path))
if config['groupUrl'] and not valid_url(config['groupUrl']):raise ValueError('Informe um convite HTTPS real de chat.whatsapp.com.')
assert config['conversionEvent'] in ['Lead','Contact','CompleteRegistration']
assert len(config['categories'])<=3
if config['pixelId']:assert re.fullmatch(r'\d{10,20}',str(config['pixelId']))
assert all(re.fullmatch(r'#[0-9a-fA-F]{6}',value) for value in config['theme'].values())
icons=[
 '<path d="m3 6 4 3 4 1 2-4 3 5 3 1 2 3-1 2H3L2 14 3 6Zm-1 8h19M8 10l-1 3m4-2-1 3"/>',
 '<path d="M6 3h8v4l2 2v10H4V9l2-2V3Zm0 4h8M4 11h12M4 16h12M7 3v2m4-2v2"/>',
 '<path d="M3 7v6m3-8v10m8-10v10m3-8v6M6 10h8"/>'
]
data={key:escape(str(value),quote=True) for key,value in config.items() if isinstance(value,str)}
data.update(config['theme'])
data['categories']=''.join('<li><svg viewBox="0 0 20 20" aria-hidden="true">'+icons[i]+'</svg>'+escape(label)+'</li>' for i,label in enumerate(config['categories']))
data['ctaAttributes']='href="'+escape(config['groupUrl'],quote=True)+'"' if config['groupUrl'] else 'href="#" aria-disabled="true"'
data['status']='Abrir convite no WhatsApp' if config['groupUrl'] else 'Grupo esportivo em breve'
html=(ROOT/'index.template.html').read_text(encoding='utf-8')
for key,value in data.items():html=html.replace('{{'+key+'}}',value)
assert '{{' not in html
dist=ROOT/'dist';dist.mkdir(exist_ok=True)
(dist/'index.html').write_text(html,encoding='utf-8')
(dist/'config.js').write_text('window.HELO_SPORT_CONFIG = Object.freeze('+json.dumps(config,ensure_ascii=False)+');\n',encoding='utf-8')
for name in ['style.css','app.js']:shutil.copyfile(ROOT/name,dist/name)
print(json.dumps({'htmlBytes':len(html.encode()),'configuredGroup':bool(config['groupUrl']),'configuredPixel':bool(config['pixelId']),'trackingEnabled':config['trackingEnabled']}))
