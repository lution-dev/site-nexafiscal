# Nexa Fiscal — site

Site estático (HTML + CSS + JS puro), sem build. Domínio: **nexafiscal.com**. Repositório: github.com/lution-dev/site-nexafiscal.

## Estrutura
- `index.html` — home
- `servicos.html` — Serviços (rota `/servicos`)
- `privacidade.html` — Política de Privacidade (rota `/privacidade`)
- `styles.css`, `app.js` — estilos e animações
- `img/` — logos, foto, logos de clientes e parceiros
- `vercel.json` — URLs limpas e cabeçalhos de cache/segurança
- `robots.txt`, `sitemap.xml`, `favicon.svg`, `og-image.png`

## Publicar na Vercel (via GitHub)
1. Em vercel.com, entre com a sua conta e clique em **Add New → Project**.
2. Importe este repositório.
3. **Framework Preset:** Other. Deixe Build Command e Output Directory vazios.
4. Clique em **Deploy**.

## Domínio nexafiscal.com (GoDaddy)
Na Vercel: **Project → Settings → Domains → Add** `nexafiscal.com` (e `www.nexafiscal.com`).
No GoDaddy (DNS), crie os registros que a Vercel mostrar. Normalmente:
- `A` — nome `@` — valor `76.76.21.21`
- `CNAME` — nome `www` — valor `cname.vercel-dns.com`

Não altere registros MX (e-mail).

## Editar
Os textos ficam em `index.html`. Cada alteração enviada ao GitHub gera um novo deploy automático.
