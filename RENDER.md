# Déploiement sur Render

Ce dépôt est prêt pour un **Background Worker Render** via Blueprint.

## Stockage persistant obligatoire

Render utilise un système de fichiers temporaire par défaut. Pour conserver les réglages du bot après un redémarrage, le service doit avoir un disque persistant avec :

```text
Mount Path : /opt/render/project/src/data
```

Le fichier `render.yaml` configure automatiquement :

```text
DATA_DIR=/opt/render/project/src/data
Disque : bot-data
Taille : 1 Go
```

Le bot enregistre alors :

```text
/opt/render/project/src/data/config.json
/opt/render/project/src/data/config.backup.json
```

## Si le service existe déjà

Dans Render, ouvre le Background Worker puis vérifie la section **Disks**. Si aucun disque n’est attaché :

1. ajoute un disque nommé `bot-data` ;
2. utilise le chemin `/opt/render/project/src/data` ;
3. choisis la taille minimale ;
4. dans **Environment**, ajoute `DATA_DIR` avec la même valeur ;
5. redéploie le service.

Les réglages faits avant l’ajout du disque ne peuvent pas être récupérés s’ils ont déjà été supprimés par un redémarrage. Après l’ajout du disque, ils restent conservés.

## Variables secrètes

- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`

## Commandes Render

- Build : `npm ci && npm run check && npm test`
- Pre-deploy : `npm run deploy`
- Start : `npm start`

Ne pousse jamais `.env`, `node_modules/`, `data/config.json` ou `data/config.backup.json` sur GitHub.
