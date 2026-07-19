# Bot Discord KI | Vlr

Bot Discord en Node.js avec captcha, bienvenue, rôles automatiques et vocaux temporaires personnalisables.

## Commandes

### Commandes administrateur

- `/captcha` : choisit le salon du captcha, le rôle à enlever et le rôle à ajouter.
- `/welcome` : choisit le salon des messages de bienvenue.
- `/voc` : choisit la catégorie et crée le salon **➕ Créer un vocal**.
- `/rolebasique` : choisit le rôle donné automatiquement aux nouveaux membres.

### Commande utilisateur

- `/setvoc` : modifie le vocal temporaire dans lequel l’utilisateur est connecté.

`/setvoc` permet de choisir :

- 🔓 **Public** ;
- 🔒 **Privé** ; le salon est automatiquement renommé **Vocal de PSEUDO (Private)** ;
- une **liste blanche** de membres autorisés à voir et rejoindre le vocal privé ;
- l’ajout de plusieurs membres à la fois avec le sélecteur **Membres autorisés** ;
- le retrait facile de plusieurs membres depuis le bouton **Liste blanche** ;
- une limite de **2, 3, 4 ou 5 utilisateurs** ;
- **Aucune limite** ;
- une limite personnalisée comprise entre **1 et 99**.

Le propriétaire peut uniquement modifier son propre vocal temporaire. Un administrateur peut modifier le vocal temporaire dans lequel il se trouve, même s’il appartient à quelqu’un d’autre.

## Fonctionnement des vocaux temporaires

Lorsqu’un membre rejoint **➕ Créer un vocal** :

1. le bot crée **Vocal de PSEUDO** ;
2. le bot enregistre le membre comme propriétaire ;
3. le membre est déplacé dans son salon ;
4. le propriétaire peut utiliser `/setvoc` ;
5. le salon est supprimé lorsqu’il devient vide.

Les identifiants, propriétaires et listes blanches des salons temporaires sont sauvegardés dans `data/config.json`.

Quand un vocal est privé, seuls son propriétaire, les membres ajoutés à la liste blanche et les administrateurs peuvent le voir et le rejoindre. Un membre retiré de la liste blanche perd immédiatement l’accès et est déconnecté s’il se trouve encore dans le vocal.

## Captcha

Le bot publie un panneau avec le bouton **Se vérifier**. Le membre reçoit une image PNG privée contenant un code de six caractères.

Le captcha :

- expire après deux minutes ;
- autorise trois essais ;
- applique un délai de dix secondes entre deux générations ;
- ajoute le rôle configuré et retire le rôle « non vérifié » après validation.

Le rôle « non vérifié » est automatiquement attribué aux nouveaux membres lorsque `/captcha` est configuré.

## Bienvenue et rôle basique

À chaque arrivée, le bot peut :

- envoyer `Bienvenue à @user sur KI | Vlr !` ;
- donner le rôle configuré avec `/rolebasique` ;
- donner le rôle « non vérifié » du captcha.

## Installation

Utilise Node.js 22 ou une version plus récente.

```bash
npm install
```

Duplique `.env.example`, renomme la copie en `.env`, puis renseigne :

```env
DISCORD_TOKEN=token_du_bot
CLIENT_ID=id_de_l_application
GUILD_ID=id_du_serveur
```

Déploie les commandes :

```bash
npm run deploy
```

Le terminal doit annoncer **5 commandes déployées**.

Démarre le bot :

```bash
npm start
```

## Permissions Discord nécessaires

Dans le Developer Portal, active **Server Members Intent**.

Le bot doit disposer de :

- Voir les salons ;
- Envoyer des messages ;
- Intégrer des liens ;
- Joindre des fichiers ;
- Voir les anciens messages ;
- Gérer les rôles ;
- Gérer les salons ;
- Se connecter ;
- Déplacer des membres.

Les scopes d’installation sont :

- `bot` ;
- `applications.commands`.

## Mise à jour d’un bot déjà installé

Remplace les fichiers du projet avec ceux de cette archive, mais conserve :

```text
.env
data/config.json
```

Puis exécute :

```bash
npm install
npm run deploy
npm start
```

Pour une mise à jour qui modifie uniquement `/setvoc`, `npm run deploy` n’est pas obligatoire, car le nom et la définition de la commande slash ne changent pas.

Les anciens vocaux temporaires créés avant cette version peuvent ne pas avoir de propriétaire enregistré. Les nouveaux vocaux créés après la mise à jour fonctionneront normalement avec `/setvoc`.

## Tests locaux

```bash
npm run check
npm test
```

## Déploiement Render

Le projet inclut désormais `render.yaml` et `.node-version`.

Pour déployer : pousse le contenu du dossier à la racine d'un dépôt GitHub privé, puis utilise **New > Blueprint** dans Render. Consulte `RENDER.md` pour les étapes détaillées.
