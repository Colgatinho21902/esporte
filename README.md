# Achadinhos da Helô — Esportes

Landing page móvel com CTA para o grupo de WhatsApp. Logo original em verde, conteúdo na primeira tela nos tamanhos testados e imagens locais WebP. Sem dependências de frontend ou fontes remotas.

## Publicar na Vercel

1. Importe este repositório como projeto novo na Vercel.
2. Framework Preset: **Other**. Root Directory: **./**.
3. A configuração do repositório usa Build Command `node prepare-vercel.cjs` e Output Directory `dist`. Não sobrescreva essas opções com valores diferentes.
4. Não precisa cadastrar token ou variável secreta. Mantenha habilitado o acesso às **System Environment Variables** da Vercel.
5. Clique Deploy. Após concluir, teste o convite e o Pixel no endereço publicado.

O build usa `VERCEL_ENV` para ativar a medição somente em produção e reconhece automaticamente os domínios fornecidos pela Vercel em `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL` e `VERCEL_BRANCH_URL`. Deploys de prévia ficam sem medição. Ao trocar o domínio ou adicionar domínio próprio, faça novo deploy para regenerar a configuração.

## Configurações e medição

Fonte editável: **config.json**. Pixel: **1042681992165459**. Convite: https://chat.whatsapp.com/DUNIFFzsCFt98ub8PohS8t . O usuário confirmou que o grupo, antes chamado Tech Barato, será adaptado para esportes.

Um PageView na abertura. Lead somente ao clicar para abrir o convite; não comprova entrada no grupo. Proteção contra clique duplo por 2,5 segundos, com novas tentativas posteriores permitidas. Pixel indisponível não bloqueia o CTA. Recusa salva em `helo_meta_consent=denied`, DNT e GPC bloqueiam os eventos. Não há API de Conversões nem token neste projeto.

Prévia local: `node prepare-vercel.cjs` e depois `python -m http.server 5196 --directory dist`. Sem ambiente de produção da Vercel, o build gera medição desativada. Os arquivos dist versionados também estão sem medição para revisão; o Deploy na Vercel ativa o Pixel na configuração gerada.

## Testes

`npm test` executa testes simulados sem enviar dados reais. A validação de recebimento no Gerenciador de Eventos é uma etapa posterior ao deploy. Verificado no navegador em 320×400, 320×568, 390×844, 483×884, 844×390 e 1366×768, sem rolagem normal e com CTA visível. Não foram testados aparelhos Android/iPhone físicos nem executado PageSpeed nesta etapa.

Para alterar texto/layout, edite config.json, index.template.html, style.css ou app.js. A Vercel reconstruirá dist. `build.py` é uma alternativa local de geração estática; a publicação na Vercel usa o script Node para configurar o ambiente correto.
