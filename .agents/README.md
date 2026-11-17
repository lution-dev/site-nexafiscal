# Instruções para agentes (IA)

Projeto: site estático da Nexa Fiscal (HTML + CSS + JS puro, sem build), publicado na Vercel em nexafiscal.com.

## Fluxo de git
- **Sempre enviar direto para a `main`.** Não criar branches de trabalho nem Pull Requests.
- Motivo: só uma pessoa trabalha neste repositório, e cada push na `main` gera deploy automático na Vercel.
- Fluxo: commit na `main` e `git push origin main`.
- Repositório: github.com/mirianbernardo/site-nexafiscal

## Regras do projeto
- Sem build, sem dependências: não adicionar `package.json` nem frameworks.
- Textos ficam em `index.html`; estilos em `styles.css`; animações em `app.js`.
- Cores: azul `#0F2747`, verde-água `#0F7C82`, verde `#6FD3A6`. Fonte: Inter (textos) e Montserrat.
- Fontes hospedadas em `/fonts` (Inter e Montserrat, subset latin, sem Google Fonts). Imagens: nunca recomprimir nem reduzir qualidade.
- Imagem de compartilhamento: `og-image.png` (1200x630). Favicon: `favicon.svg`.
- Manter `sitemap.xml`, `robots.txt` e as meta tags (canonical, og:*) apontando para https://nexafiscal.com.
- Não alterar registros de e-mail (MX) do domínio.
