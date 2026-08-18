# Inovar Elevada — site oficial

Site institucional da **Inovar Elevada Materiais de Construção**, em Vacaria/RS.

## Estrutura

- `index.html` — página principal
- `data/stories.json` — índice dos Stories ativos
- `assets/stories/` — mídias sincronizadas do Instagram
- `assets/profile.jpg` — foto do perfil
- `assets/store/loja-google-01.png` — foto real da loja
- `scripts/sync-instagram-stories.mjs` — sincronizador via Instagram Graph API
- `.github/workflows/sync-instagram-stories.yml` — execução automática

## Stories automáticos

A sincronização usa a API oficial da Meta. No GitHub, em **Settings → Secrets and variables → Actions**, cadastre:

- `INSTAGRAM_USER_ID`
- `INSTAGRAM_ACCESS_TOKEN`

Depois execute uma vez em **Actions → Sincronizar Stories da Inovar Elevada → Run workflow**.

O site lê `data/stories.json` automaticamente e mostra todos os Stories ativos **lado a lado**, sem enviar o visitante para outra aba.

## Contatos

- WhatsApp: (54) 3232-4898
- E-mail: inovar.elevada@hotmail.com
- Instagram: @inovarelevada_materiais
