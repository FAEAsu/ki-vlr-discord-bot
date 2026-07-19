# Déploiement sur Render

Ce dépôt est prêt pour un déploiement Render via **Blueprint**.

## Avant le push GitHub

Ne jamais envoyer :

- `.env`
- `node_modules/`
- `data/config.json`

Ces éléments sont déjà exclus par `.gitignore`.

## Déploiement

1. Pousse le contenu de ce dossier à la racine d'un dépôt GitHub privé.
2. Dans Render, choisis **New > Blueprint**.
3. Connecte le dépôt GitHub.
4. Render détecte `render.yaml`.
5. Renseigne les trois secrets demandés :
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
6. Applique le Blueprint.

Le Blueprint crée un **Background Worker Starter** en région Frankfurt avec un disque persistant monté sur :

```text
/opt/render/project/src/data
```

Le disque conserve `data/config.json`, qui contient les réglages du captcha, de bienvenue, des rôles et des vocaux temporaires.

## Commandes Render

- Build : `npm ci && npm run check && npm test`
- Pre-deploy : `npm run deploy`
- Start : `npm start`
