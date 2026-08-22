const crypto = require('node:crypto');
Node indique :

SyntaxError: Identifier 'crypto' has already been declared
Ça veut dire que tu as deux fois cette déclaration dans index.js. Très probablement, tu as collé le nouveau bloc à la suite de ton ancien code, au lieu de remplacer l'ancien fichier.

Ce qu'il faut faire
Dans ton index.js, cherche :

const crypto = require('node:crypto');
Tu vas probablement l'avoir une première fois tout en haut :

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
puis une deuxième fois vers la ligne 679.

Ne supprime pas juste crypto, parce qu'après Node risque de te sortir :

Identifier 'fs' has already been declared
puis path, etc.

Il faut supprimer toute la deuxième copie du code.

Ton index.js doit commencer une seule fois par :

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const {
  ActionRowBuilder,
  ActivityType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  ModalBuilder,
  OverwriteType,
  PermissionFlagsBits,
  PermissionOverwrites,
  Routes,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} = require('discord.js');
Donc : ton deploy-commands.js est OK, ne le touche pas. C'est uniquement index.js qui contient du code en double.

Si tu m'envoies ton index.js actuel, je peux te le nettoyer et te redonner un seul bloc complet, sans aucun doublon.


donne moi l'index a telechager au pire sans que ca me fasse d'erreur

Oui. Je t’ai préparé un index.js propre, sans le doublon de crypto, avec :

/maproulette pris en charge ;

le captcha qui affiche le nom réel du serveur ;

aucune double déclaration ;

l’enregistrement des slash commands laissé à ton deploy-commands.js.

J’ai vérifié le fichier avec node --check : aucune erreur de syntaxe.


Remplace simplement ton src/index.js actuel par celui-ci, puis redéploie/redémarre ton bot.



f25bd7a4-079d-411d-9657-57a83c8a7308.png
ca me fais ca quand je veux dl

Ça vient de ChatGPT Classic qui plante au moment d’ouvrir le fichier, pas de ton index.js.

Je t’ai préparé deux versions, ça peut contourner le problème :



Le .zip contient directement index.js.

J’ai revérifié le fichier avec node --check : aucune erreur de syntaxe.

Si ChatGPT Classic plante encore, ouvre cette conversation dans la version navigateur de ChatGPT et télécharge le fichier depuis là. 


Améliorez la précision du code complexe
Passez à l’offre supérieure et utilisez le modèle de raisonnement Pro de pointe pour déboguer des systèmes complexes avec une vérification plus approfondie.

Passez à Pro


Bibliothèque
/
index_corrige.txt


const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const {
  ActionRowBuilder,
  ActivityType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  ModalBuilder,
  OverwriteType,
  PermissionFlagsBits,
  PermissionOverwrites,
  Routes,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} = require('discord.js');

const token = process.env.DISCORD_TOKEN;

if (require.main === module && !token) {
  console.error('DISCORD_TOKEN doit être renseigné dans le fichier .env.');
  process.exit(1);
}

const BRAND = 'KI | Vlr';

const VALORANT_MAPS = [
  'Summit',
  'Corrode',
  'Abyss',
  'Sunset',
  'Lotus',
  'Pearl',
  'Fracture',
  'Breeze',
  'Icebox',
  'Ascent',
  'Split',
  'Haven',
  'Bind',
];

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const CONFIG_BACKUP_PATH = path.join(DATA_DIR, 'config.backup.json');
const SESSION_TTL_MS = 15 * 60 * 1000;
const CAPTCHA_TTL_MS = 2 * 60 * 1000;
const CAPTCHA_COOLDOWN_MS = 10 * 1000;
const MAX_CAPTCHA_ATTEMPTS = 3;

class ConfigStore {
  constructor(filePath, backupPath) {
    this.filePath = filePath;
    this.backupPath = backupPath;
    this.data = {};
    this.writeQueue = Promise.resolve();
    this.load();
  }

  load() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });

    const readJson = (filePath) => {
      const raw = fs.readFileSync(filePath, 'utf8');
      return raw.trim() ? JSON.parse(raw) : {};
    };

    if (!fs.existsSync(this.filePath)) {
      if (this.backupPath && fs.existsSync(this.backupPath)) {
        try {
          this.data = readJson(this.backupPath);
          fs.writeFileSync(this.filePath, `${JSON.stringify(this.data, null, 2)}\n`, 'utf8');
          console.warn('Configuration restaurée depuis la sauvegarde persistante.');
          return;
        } catch (error) {
          console.error('La sauvegarde de configuration est illisible :', error);
        }
      }

      fs.writeFileSync(this.filePath, '{}\n', 'utf8');
      return;
    }

    try {
      this.data = readJson(this.filePath);
    } catch (error) {
      console.error(`Le fichier ${this.filePath} est illisible :`, error);

      if (this.backupPath && fs.existsSync(this.backupPath)) {
        try {
          this.data = readJson(this.backupPath);
          fs.writeFileSync(this.filePath, `${JSON.stringify(this.data, null, 2)}\n`, 'utf8');
          console.warn('Configuration principale restaurée depuis la sauvegarde.');
          return;
        } catch (backupError) {
          console.error('La sauvegarde de configuration est également illisible :', backupError);
        }
      }

      process.exit(1);
    }
  }

  getGuild(guildId) {
    if (!this.data[guildId]) {
      this.data[guildId] = {
        captcha: null,
        welcome: null,
        voice: null,
        basicRole: null,
      };
    }

    const guildConfig = this.data[guildId];
    if (!("basicRole" in guildConfig)) guildConfig.basicRole = null;

    if (guildConfig.voice) {
      if (!Array.isArray(guildConfig.voice.tempChannelIds)) {
        guildConfig.voice.tempChannelIds = [];
      }

      if (
        !guildConfig.voice.tempChannelOwners ||
        typeof guildConfig.voice.tempChannelOwners !== 'object' ||
        Array.isArray(guildConfig.voice.tempChannelOwners)
      ) {
        guildConfig.voice.tempChannelOwners = {};
      }

      if (
        !guildConfig.voice.tempChannelWhitelists ||
        typeof guildConfig.voice.tempChannelWhitelists !== 'object' ||
        Array.isArray(guildConfig.voice.tempChannelWhitelists)
      ) {
        guildConfig.voice.tempChannelWhitelists = {};
      }

      if (
        !guildConfig.voice.tempChannelPrivateStates ||
        typeof guildConfig.voice.tempChannelPrivateStates !== 'object' ||
        Array.isArray(guildConfig.voice.tempChannelPrivateStates)
      ) {
        guildConfig.voice.tempChannelPrivateStates = {};
      }

      for (const channelId of guildConfig.voice.tempChannelIds) {
        if (!Array.isArray(guildConfig.voice.tempChannelWhitelists[channelId])) {
          guildConfig.voice.tempChannelWhitelists[channelId] = [];
        }
      }
    }

    return guildConfig;
  }

  async updateGuild(guildId, updater) {
    const guildConfig = this.getGuild(guildId);
    updater(guildConfig);
    await this.save();
    return guildConfig;
  }

  async save() {
    const snapshot = JSON.stringify(this.data, null, 2) + '\n';
    const temporaryPath = `${this.filePath}.tmp`;

    const operation = this.writeQueue.catch(() => null).then(async () => {
      await fs.promises.writeFile(temporaryPath, snapshot, 'utf8');

      try {
        await fs.promises.rename(temporaryPath, this.filePath);
      } catch (error) {
        if (!['EEXIST', 'EPERM'].includes(error.code)) throw error;
        await fs.promises.copyFile(temporaryPath, this.filePath);
        await fs.promises.unlink(temporaryPath).catch(() => null);
      }

      if (this.backupPath) {
        await fs.promises.copyFile(this.filePath, this.backupPath);
      }
    });

    this.writeQueue = operation;
    return operation;
  }
}

const store = new ConfigStore(CONFIG_PATH, CONFIG_BACKUP_PATH);
console.log(`Configuration enregistrée dans : ${CONFIG_PATH}`);
if (process.env.RENDER === 'true' && !process.env.DATA_DIR) {
  console.warn(
    'ATTENTION : DATA_DIR n’est pas défini. Sans disque Render monté sur le dossier data, la configuration sera perdue au redémarrage.',
  );
}
const setupSessions = new Map();
const activeCaptchas = new Map();
const captchaCooldowns = new Map();
const voiceCreationLocks = new Set();
const whitelistAddDrafts = new Map();
const whitelistRemoveDrafts = new Map();
const voiceVisibilityLocks = new Set();
const voiceRenameStates = new Map();
const VOICE_RENAME_WINDOW_MS = 10 * 60 * 1000;
const VOICE_RENAME_MAX_CHANGES = 2;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

function sessionKey(type, guildId, userId) {
  return `${type}:${guildId}:${userId}`;
}

function createSession(type, guildId, userId, values = {}) {
  const key = sessionKey(type, guildId, userId);
  const session = {
    type,
    guildId,
    ownerId: userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
    ...values,
  };

  setupSessions.set(key, session);
  return session;
}

function getSession(type, guildId, userId) {
  const key = sessionKey(type, guildId, userId);
  const session = setupSessions.get(key);

  if (!session || session.expiresAt < Date.now()) {
    setupSessions.delete(key);
    return null;
  }

  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return session;
}

function deleteSession(type, guildId, userId) {
  setupSessions.delete(sessionKey(type, guildId, userId));
}

function mentionChannel(channelId) {
  return channelId ? `<#${channelId}>` : '`Non choisi`';
}

function mentionRole(roleId) {
  return roleId ? `<@&${roleId}>` : '`Non choisi`';
}

function baseSetupEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `${BRAND} • Configuration réservée aux administrateurs` });
}

function buildCaptchaSetupPanel(session) {
  const embed = baseSetupEmbed(
    'Configuration du captcha',
    [
      'Choisis les trois éléments puis clique sur **Enregistrer**.',
      '',
      `**Salon du captcha :** ${mentionChannel(session.channelId)}`,
      `**Rôle à enlever :** ${mentionRole(session.removeRoleId)}`,
      `**Rôle à ajouter :** ${mentionRole(session.addRoleId)}`,
    ].join('\n'),
  );

  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId(`setup:captcha:channel:${session.ownerId}`)
    .setPlaceholder('Choisir le salon du captcha')
    .setChannelTypes(ChannelType.GuildText)
    .setMinValues(1)
    .setMaxValues(1);

  const removeRoleSelect = new RoleSelectMenuBuilder()
    .setCustomId(`setup:captcha:remove:${session.ownerId}`)
    .setPlaceholder('Choisir le rôle à enlever')
    .setMinValues(1)
    .setMaxValues(1);

  const addRoleSelect = new RoleSelectMenuBuilder()
    .setCustomId(`setup:captcha:add:${session.ownerId}`)
    .setPlaceholder('Choisir le rôle à ajouter')
    .setMinValues(1)
    .setMaxValues(1);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`setup:captcha:save:${session.ownerId}`)
      .setLabel('Enregistrer')
      .setEmoji('💾')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`setup:captcha:cancel:${session.ownerId}`)
      .setLabel('Annuler')
      .setStyle(ButtonStyle.Secondary),
  );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(channelSelect),
      new ActionRowBuilder().addComponents(removeRoleSelect),
      new ActionRowBuilder().addComponents(addRoleSelect),
      buttons,
    ],
  };
}

function buildWelcomeSetupPanel(session) {
  const embed = baseSetupEmbed(
    'Configuration des messages de bienvenue',
    [
      'Choisis le salon qui recevra les messages de bienvenue.',
      '',
      `**Salon sélectionné :** ${mentionChannel(session.channelId)}`,
      '',
      'Message envoyé :',
      '> Bienvenue à @user sur KI | Vlr !',
    ].join('\n'),
  );

  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId(`setup:welcome:channel:${session.ownerId}`)
    .setPlaceholder('Choisir le salon de bienvenue')
    .setChannelTypes(ChannelType.GuildText)
    .setMinValues(1)
    .setMaxValues(1);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`setup:welcome:save:${session.ownerId}`)
      .setLabel('Enregistrer')
      .setEmoji('💾')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`setup:welcome:cancel:${session.ownerId}`)
      .setLabel('Annuler')
      .setStyle(ButtonStyle.Secondary),
  );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(channelSelect), buttons],
  };
}

function buildBasicRoleSetupPanel(session) {
  const embed = baseSetupEmbed(
    'Configuration du rôle basique',
    [
      'Choisis le rôle qui sera automatiquement donné à chaque nouveau membre.',
      '',
      `**Rôle sélectionné :** ${mentionRole(session.roleId)}`,
      '',
      'Le rôle du bot doit être placé au-dessus du rôle choisi.',
    ].join('\n'),
  );

  const roleSelect = new RoleSelectMenuBuilder()
    .setCustomId(`setup:basicrole:role:${session.ownerId}`)
    .setPlaceholder('Choisir le rôle donné à l’arrivée')
    .setMinValues(1)
    .setMaxValues(1);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`setup:basicrole:save:${session.ownerId}`)
      .setLabel('Enregistrer')
      .setEmoji('💾')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`setup:basicrole:cancel:${session.ownerId}`)
      .setLabel('Annuler')
      .setStyle(ButtonStyle.Secondary),
  );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(roleSelect), buttons],
  };
}

function buildVoiceSetupPanel(session) {
  const embed = baseSetupEmbed(
    'Configuration des vocaux temporaires',
    [
      'Choisis une catégorie. Le bot y créera le salon **➕ Créer un vocal**.',
      '',
      `**Catégorie sélectionnée :** ${mentionChannel(session.categoryId)}`,
      '',
      'Lorsqu’un membre rejoint ce salon, le bot crée **Vocal de PSEUDO**, déplace le membre dedans, puis supprime le vocal lorsqu’il est vide.',
    ].join('\n'),
  );

  const categorySelect = new ChannelSelectMenuBuilder()
    .setCustomId(`setup:voice:category:${session.ownerId}`)
    .setPlaceholder('Choisir la catégorie des vocaux')
    .setChannelTypes(ChannelType.GuildCategory)
    .setMinValues(1)
    .setMaxValues(1);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`setup:voice:save:${session.ownerId}`)
      .setLabel('Créer le système')
      .setEmoji('🔊')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`setup:voice:cancel:${session.ownerId}`)
      .setLabel('Annuler')
      .setStyle(ButtonStyle.Secondary),
  );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(categorySelect), buttons],
  };
}

function isTemporaryVoicePrivate(channel, guildId = channel.guild?.id) {
  if (guildId) {
    const storedState = store.getGuild(guildId).voice?.tempChannelPrivateStates?.[channel.id];
    if (typeof storedState === 'boolean') return storedState;
  }

  return channel.name.endsWith(PRIVATE_VOICE_SUFFIX);
}

async function setTemporaryVoicePrivateState(guildId, channelId, isPrivate) {
  await store.updateGuild(guildId, (guildConfig) => {
    if (!guildConfig.voice) return;
    guildConfig.voice.tempChannelPrivateStates =
      guildConfig.voice.tempChannelPrivateStates ?? {};
    guildConfig.voice.tempChannelPrivateStates[channelId] = Boolean(isPrivate);
  });
}

function buildSyncedVoiceOverwrites(parentChannel) {
  return parentChannel.permissionOverwrites.cache.map((overwrite) => ({
    id: overwrite.id,
    type: overwrite.type,
    allow: overwrite.allow.bitfield,
    deny: overwrite.deny.bitfield,
  }));
}

async function replacePermissionOverwritesFast(channel, overwrites, reason) {
  const freshChannel =
    (await channel.guild.channels.fetch(channel.id, { force: true }).catch(() => null)) ?? channel;
  const resolvedOverwrites = overwrites.map((overwrite) =>
    PermissionOverwrites.resolve(overwrite, channel.guild),
  );
  const desiredIds = new Set(resolvedOverwrites.map((overwrite) => overwrite.id));

  const deletions = [...freshChannel.permissionOverwrites.cache.keys()]
    .filter((overwriteId) => !desiredIds.has(overwriteId))
    .map((overwriteId) =>
      client.rest.delete(Routes.channelPermission(channel.id, overwriteId), { reason }),
    );

  const updates = resolvedOverwrites.map((overwrite) =>
    client.rest.put(Routes.channelPermission(channel.id, overwrite.id), {
      body: overwrite,
      reason,
    }),
  );

  await Promise.all([...deletions, ...updates]);

  return (
    (await channel.guild.channels.fetch(channel.id, { force: true }).catch(() => null)) ?? channel
  );
}

function whitelistDraftKey(guildId, channelId, userId) {
  return `${guildId}:${channelId}:${userId}`;
}

function clearWhitelistDraftsForChannel(guildId, channelId) {
  const prefix = `${guildId}:${channelId}:`;

  for (const key of whitelistAddDrafts.keys()) {
    if (key.startsWith(prefix)) whitelistAddDrafts.delete(key);
  }

  for (const key of whitelistRemoveDrafts.keys()) {
    if (key.startsWith(prefix)) whitelistRemoveDrafts.delete(key);
  }
}

function uniqueSnowflakes(values) {
  return [...new Set(values.filter((value) => /^\d{17,20}$/.test(value)))];
}

function getTemporaryVoiceWhitelist(guildId, channelId) {
  const voiceConfig = store.getGuild(guildId).voice;
  return uniqueSnowflakes(voiceConfig?.tempChannelWhitelists?.[channelId] ?? []);
}

async function setTemporaryVoiceWhitelist(guildId, channelId, memberIds) {
  const cleanedIds = uniqueSnowflakes(memberIds);

  await store.updateGuild(guildId, (guildConfig) => {
    if (!guildConfig.voice) return;
    guildConfig.voice.tempChannelWhitelists = guildConfig.voice.tempChannelWhitelists ?? {};
    guildConfig.voice.tempChannelWhitelists[channelId] = cleanedIds;
  });

  return cleanedIds;
}

function buildPrivateVoiceOverwrites(guild, ownerId, allowedMemberIds = []) {
  const overwrites = [
    {
      id: guild.roles.everyone.id,
      type: OverwriteType.Role,
      deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
    },
  ];

  const allowedPermissions = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.Stream,
    PermissionFlagsBits.UseVAD,
  ];

  for (const memberId of uniqueSnowflakes([ownerId, ...allowedMemberIds].filter(Boolean))) {
    overwrites.push({
      id: memberId,
      type: OverwriteType.Member,
      allow: allowedPermissions,
    });
  }

  if (guild.members.me) {
    overwrites.push({
      id: guild.members.me.id,
      type: OverwriteType.Member,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.MoveMembers,
      ],
    });
  }

  return overwrites;
}

function formatVoiceLimit(userLimit) {
  return userLimit === 0 ? 'Aucune limite' : `${userLimit} utilisateur(s)`;
}

function buildSetVocPanel(channel, ownerId, options = {}) {
  const isPrivate =
    typeof options.isPrivate === 'boolean'
      ? options.isPrivate
      : isTemporaryVoicePrivate(channel);
  const allowedMemberIds = uniqueSnowflakes(options.allowedMemberIds ?? []);
  const pendingMemberIds = uniqueSnowflakes(options.pendingMemberIds ?? []);
  const pendingText = pendingMemberIds.length
    ? pendingMemberIds.map((memberId) => `<@${memberId}>`).join(', ')
    : '`Aucune sélection`';

  const description = [
    `**Propriétaire :** ${ownerId ? `<@${ownerId}>` : '`Non enregistré`'}`,
    `**Visibilité :** ${isPrivate ? '🔒 Privé' : '🔓 Public'}`,
    `**Utilisateurs maximum :** ${formatVoiceLimit(channel.userLimit)}`,
  ];

  if (isPrivate) {
    description.push(
      `**Membres autorisés :** ${allowedMemberIds.length}`,
      `**Sélection en attente :** ${pendingText}`,
      '',
      'Sélectionne un ou plusieurs membres, puis clique sur **Valider**.',
    );
  } else {
    description.push('', 'Les changements sont appliqués immédiatement.');
  }

  const embed = new EmbedBuilder()
    .setColor(isPrivate ? 0xed4245 : 0x57f287)
    .setTitle(`Réglages de ${channel.name}`)
    .setDescription(description.join('\n'))
    .setFooter({ text: `${BRAND} • Gestion du vocal temporaire` });

  const visibilityButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`setvoc:visibility:public:${channel.id}`)
      .setLabel('Public')
      .setEmoji('🔓')
      .setStyle(ButtonStyle.Success)
      .setDisabled(!isPrivate),
    new ButtonBuilder()
      .setCustomId(`setvoc:visibility:private:${channel.id}`)
      .setLabel('Privé')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(isPrivate),
  );

  const limitSelect = new StringSelectMenuBuilder()
    .setCustomId(`setvoc:limit:${channel.id}`)
    .setPlaceholder('Choisir le nombre maximum d’utilisateurs')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      { label: '2 utilisateurs', value: '2', emoji: '2️⃣' },
      { label: '3 utilisateurs', value: '3', emoji: '3️⃣' },
      { label: '4 utilisateurs', value: '4', emoji: '4️⃣' },
      { label: '5 utilisateurs', value: '5', emoji: '5️⃣' },
      { label: 'Aucune limite', value: '0', emoji: '♾️' },
      { label: 'Nombre personnalisé', value: 'custom', emoji: '✏️' },
    );

  const components = [visibilityButtons, new ActionRowBuilder().addComponents(limitSelect)];

  if (isPrivate) {
    const memberSelect = new UserSelectMenuBuilder()
      .setCustomId(`setvoc:whitelist:addselect:${channel.id}`)
      .setPlaceholder('Membres autorisés — sélection multiple')
      .setMinValues(1)
      .setMaxValues(25);

    const whitelistButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`setvoc:whitelist:add:${channel.id}`)
        .setLabel('Valider')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success)
        .setDisabled(pendingMemberIds.length === 0),
      new ButtonBuilder()
        .setCustomId(`setvoc:whitelist:list:${channel.id}`)
        .setLabel('Liste blanche')
        .setEmoji('📋')
        .setStyle(ButtonStyle.Secondary),
    );

    components.push(new ActionRowBuilder().addComponents(memberSelect), whitelistButtons);
  }

  return { embeds: [embed], components };
}

function buildWhitelistPanel(channel, ownerId, allowedMembers, page = 0, selectedIds = []) {
  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(allowedMembers.length / pageSize));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const pageMembers = allowedMembers.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const selected = new Set(selectedIds);

  const lines = allowedMembers.length
    ? pageMembers.map((member, index) => {
        const position = safePage * pageSize + index + 1;
        return `${position}. <@${member.id}>`;
      })
    : ['`Aucun membre dans la liste blanche.`'];

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`Liste blanche de ${channel.name}`)
    .setDescription(
      [
        `**Propriétaire :** ${ownerId ? `<@${ownerId}>` : '`Non enregistré`'}`,
        `**Membres autorisés :** ${allowedMembers.length}`,
        '',
        ...lines,
        '',
        allowedMembers.length
          ? 'Sélectionne les membres à retirer, puis clique sur **Retirer**.'
          : 'Retourne au panneau pour ajouter des membres.',
      ].join('\n'),
    )
    .setFooter({ text: `${BRAND} • Page ${safePage + 1}/${totalPages}` });

  const components = [];

  if (pageMembers.length) {
    const removeSelect = new StringSelectMenuBuilder()
      .setCustomId(`setvoc:whitelist:removeselect:${channel.id}:${safePage}`)
      .setPlaceholder('Choisir les membres à retirer')
      .setMinValues(1)
      .setMaxValues(pageMembers.length)
      .addOptions(
        pageMembers.map((member) => ({
          label: member.displayName.slice(0, 100),
          description: `@${member.user.username}`.slice(0, 100),
          value: member.id,
          default: selected.has(member.id),
        })),
      );

    components.push(new ActionRowBuilder().addComponents(removeSelect));
  }

  const navigationButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`setvoc:whitelist:remove:${channel.id}:${safePage}`)
      .setLabel('Retirer')
      .setEmoji('➖')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(selected.size === 0),
    new ButtonBuilder()
      .setCustomId(`setvoc:whitelist:page:previous:${channel.id}:${safePage}`)
      .setLabel('Précédent')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage === 0),
    new ButtonBuilder()
      .setCustomId(`setvoc:whitelist:page:next:${channel.id}:${safePage}`)
      .setLabel('Suivant')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage >= totalPages - 1),
    new ButtonBuilder()
      .setCustomId(`setvoc:whitelist:back:${channel.id}`)
      .setLabel('Retour')
      .setEmoji('↩️')
      .setStyle(ButtonStyle.Primary),
  );

  components.push(navigationButtons);
  return { embeds: [embed], components };
}

function isAdministrator(interaction) {
  return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ?? false;
}

async function ensureSetupOwner(interaction, ownerId) {
  if (interaction.user.id !== ownerId || !isAdministrator(interaction)) {
    await interaction.reply({
      content: '❌ Ce panneau appartient à un autre administrateur.',
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}

function roleCanBeManaged(role, guild) {
  const botMember = guild.members.me;
  return Boolean(
    role &&
      botMember &&
      role.id !== guild.id &&
      !role.managed &&
      botMember.permissions.has(PermissionFlagsBits.ManageRoles) &&
      botMember.roles.highest.comparePositionTo(role) > 0,
  );
}

function channelCanReceiveMessages(channel, guild, { needsAttachments = false } = {}) {
  const botMember = guild.members.me;
  if (!channel || !botMember || !channel.isTextBased()) return false;

  const requiredPermissions = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
  ];

  if (needsAttachments) requiredPermissions.push(PermissionFlagsBits.AttachFiles);

  const permissions = channel.permissionsFor(botMember);
  return permissions?.has(requiredPermissions);
}

function randomFromAlphabet(length, alphabet) {
  let result = '';
  for (let index = 0; index < length; index += 1) {
    result += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return result;
}

function createCaptchaCode() {
  return randomFromAlphabet(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
}

function createNonce() {
  return crypto.randomBytes(12).toString('hex');
}

const CAPTCHA_FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  6: ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
};

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let number = 0; number < 256; number += 1) {
    let crc = number;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[number] = crc >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y += 1) {
    const targetOffset = y * (width * 4 + 1);
    scanlines[targetOffset] = 0;
    rgba.copy(scanlines, targetOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function setPixel(buffer, width, height, x, y, red, green, blue, alpha = 255) {
  const roundedX = Math.round(x);
  const roundedY = Math.round(y);
  if (roundedX < 0 || roundedX >= width || roundedY < 0 || roundedY >= height) return;

  const offset = (roundedY * width + roundedX) * 4;
  buffer[offset] = red;
  buffer[offset + 1] = green;
  buffer[offset + 2] = blue;
  buffer[offset + 3] = alpha;
}

function fillRect(buffer, width, height, x, y, rectangleWidth, rectangleHeight, color) {
  for (let offsetY = 0; offsetY < rectangleHeight; offsetY += 1) {
    for (let offsetX = 0; offsetX < rectangleWidth; offsetX += 1) {
      setPixel(buffer, width, height, x + offsetX, y + offsetY, ...color);
    }
  }
}

function drawLine(buffer, width, height, startX, startY, endX, endY, color, thickness = 1) {
  let x0 = Math.round(startX);
  let y0 = Math.round(startY);
  const x1 = Math.round(endX);
  const y1 = Math.round(endY);
  const deltaX = Math.abs(x1 - x0);
  const stepX = x0 < x1 ? 1 : -1;
  const deltaY = -Math.abs(y1 - y0);
  const stepY = y0 < y1 ? 1 : -1;
  let error = deltaX + deltaY;

  while (true) {
    fillRect(
      buffer,
      width,
      height,
      x0 - Math.floor(thickness / 2),
      y0 - Math.floor(thickness / 2),
      thickness,
      thickness,
      color,
    );
    if (x0 === x1 && y0 === y1) break;
    const doubledError = 2 * error;
    if (doubledError >= deltaY) {
      error += deltaY;
      x0 += stepX;
    }
    if (doubledError <= deltaX) {
      error += deltaX;
      y0 += stepY;
    }
  }
}

function createCaptchaImage(code) {
  const width = 520;
  const height = 180;
  const pixels = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    const ratio = y / height;
    const red = Math.round(17 + 32 * ratio);
    const green = Math.round(24 + 22 * ratio);
    const blue = Math.round(39 + 90 * ratio);
    fillRect(pixels, width, height, 0, y, width, 1, [red, green, blue, 255]);
  }

  for (let index = 0; index < 14; index += 1) {
    drawLine(
      pixels,
      width,
      height,
      crypto.randomInt(0, width),
      crypto.randomInt(0, height),
      crypto.randomInt(0, width),
      crypto.randomInt(0, height),
      [crypto.randomInt(90, 190), crypto.randomInt(100, 210), 255, 255],
      crypto.randomInt(1, 4),
    );
  }

  const scale = 11;
  const characterSpacing = 76;
  const startX = 45;
  const baseY = 44;

  [...code].forEach((character, characterIndex) => {
    const pattern = CAPTCHA_FONT[character];
    const jitterX = crypto.randomInt(-5, 6);
    const jitterY = crypto.randomInt(-12, 13);
    const rowSkew = crypto.randomInt(-2, 3);
    const color = characterIndex % 2 === 0 ? [255, 255, 255, 255] : [199, 210, 254, 255];

    pattern.forEach((row, rowIndex) => {
      [...row].forEach((cell, columnIndex) => {
        if (cell !== '1') return;
        const x =
          startX +
          characterIndex * characterSpacing +
          jitterX +
          columnIndex * scale +
          rowIndex * rowSkew;
        const y = baseY + jitterY + rowIndex * scale;
        fillRect(pixels, width, height, x + 3, y + 4, scale - 1, scale - 1, [0, 0, 0, 110]);
        fillRect(pixels, width, height, x, y, scale - 1, scale - 1, color);
      });
    });
  });

  for (let index = 0; index < 450; index += 1) {
    setPixel(
      pixels,
      width,
      height,
      crypto.randomInt(0, width),
      crypto.randomInt(0, height),
      255,
      255,
      255,
      255,
    );
  }

  for (let index = 0; index < 4; index += 1) {
    drawLine(
      pixels,
      width,
      height,
      crypto.randomInt(0, Math.floor(width / 3)),
      crypto.randomInt(20, height - 20),
      crypto.randomInt(Math.ceil((width * 2) / 3), width),
      crypto.randomInt(20, height - 20),
      [255, 255, 255, 255],
      crypto.randomInt(1, 3),
    );
  }

  return encodePng(width, height, pixels);
}

function verificationPanel(guildName) {
  const serverName = guildName || 'ce serveur';

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Vérification du serveur')
    .setDescription(
      [
        `Bienvenue sur **${serverName}** !`,
        '',
        'Clique sur le bouton ci-dessous, recopie le code affiché et tu recevras automatiquement ton rôle.',
      ].join('\n'),
    )
    .setFooter({ text: 'Le captcha expire après 2 minutes.' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('captcha:start')
      .setLabel('Se vérifier')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
  );

  return { embeds: [embed], components: [row] };
}

async function handleAdminCommand(interaction) {
  if (!interaction.inGuild() || !isAdministrator(interaction)) {
    await interaction.reply({
      content: '❌ Cette commande est réservée aux administrateurs du serveur.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const guildConfig = store.getGuild(interaction.guildId);

  if (interaction.commandName === 'captcha') {
    const session = createSession('captcha', interaction.guildId, interaction.user.id, {
      channelId: guildConfig.captcha?.channelId ?? null,
      removeRoleId: guildConfig.captcha?.removeRoleId ?? null,
      addRoleId: guildConfig.captcha?.addRoleId ?? null,
    });

    await interaction.reply({
      ...buildCaptchaSetupPanel(session),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.commandName === 'welcome') {
    const session = createSession('welcome', interaction.guildId, interaction.user.id, {
      channelId: guildConfig.welcome?.channelId ?? null,
    });

    await interaction.reply({
      ...buildWelcomeSetupPanel(session),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.commandName === 'voc') {
    const session = createSession('voice', interaction.guildId, interaction.user.id, {
      categoryId: guildConfig.voice?.categoryId ?? null,
    });

    await interaction.reply({
      ...buildVoiceSetupPanel(session),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.commandName === 'rolebasique') {
    const session = createSession('basicrole', interaction.guildId, interaction.user.id, {
      roleId: guildConfig.basicRole?.roleId ?? null,
    });

    await interaction.reply({
      ...buildBasicRoleSetupPanel(session),
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function replySetVocError(interaction, content) {
  const payload = { content, embeds: [], components: [] };

  if (interaction.deferred) {
    await interaction.editReply(payload).catch(() => null);
    return;
  }

  if (interaction.replied) {
    await interaction
      .followUp({ content, flags: MessageFlags.Ephemeral })
      .catch(() => null);
    return;
  }

  await interaction
    .reply({ content, flags: MessageFlags.Ephemeral })
    .catch(() => null);
}

async function getSetVocTarget(interaction, expectedChannelId = null) {
  if (!interaction.inGuild()) {
    await replySetVocError(
      interaction,
      '❌ Cette commande peut uniquement être utilisée dans un serveur.',
    );
    return null;
  }

  const member =
    interaction.member?.voice !== undefined
      ? interaction.member
      : await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  const currentChannelId = member?.voice.channelId;

  if (!currentChannelId) {
    await replySetVocError(
      interaction,
      '❌ Tu dois être connecté à un salon vocal pour utiliser `/setvoc`.',
    );
    return null;
  }

  if (expectedChannelId && currentChannelId !== expectedChannelId) {
    await replySetVocError(
      interaction,
      '❌ Tu as quitté ce vocal ou changé de salon. Relance `/setvoc` dans le vocal à modifier.',
    );
    return null;
  }

  const voiceConfig = store.getGuild(interaction.guildId).voice;
  if (!voiceConfig?.tempChannelIds?.includes(currentChannelId)) {
    await replySetVocError(
      interaction,
      '❌ Le salon dans lequel tu te trouves n’est pas un vocal temporaire créé par le bot.',
    );
    return null;
  }

  const ownerId = voiceConfig.tempChannelOwners?.[currentChannelId] ?? null;
  if (!isAdministrator(interaction) && ownerId !== interaction.user.id) {
    await replySetVocError(
      interaction,
      ownerId
        ? '❌ Ce vocal temporaire ne t’appartient pas.'
        : '❌ Le propriétaire de cet ancien vocal n’est pas enregistré. Recrée un nouveau vocal temporaire.',
    );
    return null;
  }

  const cachedChannel = interaction.guild.channels.cache.get(currentChannelId);
  const channel =
    cachedChannel ??
    (await interaction.guild.channels.fetch(currentChannelId).catch(() => null));
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    await replySetVocError(interaction, '❌ Ce salon vocal est introuvable.');
    return null;
  }

  const botPermissions = channel.permissionsFor(interaction.guild.members.me);
  if (
    !botPermissions?.has([
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageRoles,
    ])
  ) {
    await replySetVocError(
      interaction,
      '❌ Le bot a besoin des permissions **Gérer les salons** et **Gérer les rôles** dans ce vocal.',
    );
    return null;
  }

  return { channel, ownerId };
}

async function handleSetVocCommand(interaction) {
  const target = await getSetVocTarget(interaction);
  if (!target) return;

  const allowedMemberIds = getTemporaryVoiceWhitelist(interaction.guildId, target.channel.id);
  const pendingMemberIds = whitelistAddDrafts.get(
    whitelistDraftKey(interaction.guildId, target.channel.id, interaction.user.id),
  ) ?? [];

  await interaction.reply({
    ...buildSetVocPanel(target.channel, target.ownerId, { allowedMemberIds, pendingMemberIds }),
    flags: MessageFlags.Ephemeral,
  });
}

async function handleSetVocVisibilityButton(interaction) {
  const [, , visibility, channelId] = interaction.customId.split(':');

  // Accusé de réception avant tout fetch ou changement Discord : le bouton ne peut plus expirer.
  await interaction.deferUpdate();

  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  if (!['private', 'public'].includes(visibility)) {
    await replySetVocError(interaction, '❌ Cette option de visibilité est invalide.');
    return;
  }

  if (voiceVisibilityLocks.has(channelId)) {
    await interaction
      .followUp({
        content: '⏳ Une modification de ce vocal est déjà en cours. Réessaie dans un instant.',
        flags: MessageFlags.Ephemeral,
      })
      .catch(() => null);
    return;
  }

  const isPrivate = visibility === 'private';
  let parentChannel = null;

  if (!isPrivate) {
    parentChannel =
      target.channel.parent ??
      (target.channel.parentId
        ? await interaction.guild.channels.fetch(target.channel.parentId).catch(() => null)
        : null);

    if (!parentChannel || parentChannel.type !== ChannelType.GuildCategory) {
      await replySetVocError(
        interaction,
        '❌ Impossible de restaurer les permissions : ce vocal n’a plus de catégorie.',
      );
      return;
    }
  }

  voiceVisibilityLocks.add(channelId);
  const reason = `Visibilité du vocal modifiée par ${interaction.user.tag}`;

  try {
    const overwrites = isPrivate
      ? buildPrivateVoiceOverwrites(
          interaction.guild,
          target.ownerId,
          getTemporaryVoiceWhitelist(interaction.guildId, channelId),
        )
      : buildSyncedVoiceOverwrites(parentChannel);

    // Une seule requête de permissions, sans attendre le renommage du salon.
    // Discord limite fortement les renommages répétés ; ils sont synchronisés en arrière-plan.
    const refreshedChannel = await replacePermissionOverwritesFast(
      target.channel,
      overwrites,
      reason,
    );
    await setTemporaryVoicePrivateState(interaction.guildId, channelId, isPrivate);

    if (!isPrivate) clearWhitelistDraftsForChannel(interaction.guildId, channelId);

    await interaction.editReply(
      buildSetVocPanel(refreshedChannel, target.ownerId, {
        isPrivate,
        allowedMemberIds: getTemporaryVoiceWhitelist(interaction.guildId, channelId),
      }),
    );

    scheduleTemporaryVoiceNameSync(refreshedChannel, isPrivate);
  } catch (error) {
    console.error(`Impossible de passer le vocal ${channelId} en ${visibility} :`, error);

    await interaction
      .editReply({
        content:
          '❌ Le changement de visibilité a échoué. Vérifie les permissions du bot puis réessaie.',
        embeds: [],
        components: [],
      })
      .catch(() => null);
  } finally {
    voiceVisibilityLocks.delete(channelId);
  }
}

async function fetchWhitelistMembers(guild, memberIds) {
  const members = [];

  for (const memberId of memberIds) {
    const member = await guild.members.fetch(memberId).catch(() => null);
    if (member && !member.user.bot) members.push(member);
  }

  return members;
}

async function handleWhitelistAddSelect(interaction) {
  const [, , , channelId] = interaction.customId.split(':');
  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  if (!isTemporaryVoicePrivate(target.channel)) {
    await interaction.reply({
      content: '❌ Passe d’abord le vocal en **Privé** pour gérer la liste blanche.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const selectedIds = uniqueSnowflakes(interaction.values).filter(
    (memberId) =>
      memberId !== target.ownerId &&
      memberId !== interaction.guild.members.me?.id &&
      !interaction.users.get(memberId)?.bot,
  );
  const draftKey = whitelistDraftKey(interaction.guildId, channelId, interaction.user.id);
  whitelistAddDrafts.set(draftKey, selectedIds);

  await interaction.update(
    buildSetVocPanel(target.channel, target.ownerId, {
      allowedMemberIds: getTemporaryVoiceWhitelist(interaction.guildId, channelId),
      pendingMemberIds: selectedIds,
    }),
  );
}

async function handleWhitelistAddButton(interaction) {
  const [, , , channelId] = interaction.customId.split(':');
  await interaction.deferUpdate();

  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  if (!isTemporaryVoicePrivate(target.channel)) {
    await replySetVocError(
      interaction,
      '❌ Passe d’abord le vocal en **Privé** pour gérer la liste blanche.',
    );
    return;
  }

  const draftKey = whitelistDraftKey(interaction.guildId, channelId, interaction.user.id);
  const pendingIds = whitelistAddDrafts.get(draftKey) ?? [];
  if (!pendingIds.length) {
    await replySetVocError(
      interaction,
      '❌ Sélectionne au moins un membre avant de cliquer sur **Valider**.',
    );
    return;
  }

  const validMembers = await fetchWhitelistMembers(interaction.guild, pendingIds);
  const currentIds = getTemporaryVoiceWhitelist(interaction.guildId, channelId);
  const updatedIds = await setTemporaryVoiceWhitelist(
    interaction.guildId,
    channelId,
    [...currentIds, ...validMembers.map((member) => member.id)],
  );

  const refreshedChannel = await replacePermissionOverwritesFast(
    target.channel,
    buildPrivateVoiceOverwrites(interaction.guild, target.ownerId, updatedIds),
    `Liste blanche modifiée par ${interaction.user.tag}`,
  );

  whitelistAddDrafts.delete(draftKey);
  await interaction.editReply(
    buildSetVocPanel(refreshedChannel, target.ownerId, { allowedMemberIds: updatedIds }),
  );
}

async function showWhitelistPanel(interaction, channelId, ownerId, page = 0) {
  const allowedIds = getTemporaryVoiceWhitelist(interaction.guildId, channelId);
  const members = await fetchWhitelistMembers(interaction.guild, allowedIds);
  const existingIds = new Set(members.map((member) => member.id));

  if (existingIds.size !== allowedIds.length) {
    await setTemporaryVoiceWhitelist(
      interaction.guildId,
      channelId,
      allowedIds.filter((memberId) => existingIds.has(memberId)),
    );
  }

  const totalPages = Math.max(1, Math.ceil(members.length / 25));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const removeKey = whitelistDraftKey(interaction.guildId, channelId, interaction.user.id);
  const selectedIds = whitelistRemoveDrafts.get(removeKey) ?? [];

  const payload = buildWhitelistPanel(
    await interaction.guild.channels.fetch(channelId, { force: true }),
    ownerId,
    members,
    safePage,
    selectedIds,
  );

  if (interaction.deferred) {
    await interaction.editReply(payload);
  } else {
    await interaction.update(payload);
  }
}

async function handleWhitelistListButton(interaction) {
  const [, , , channelId] = interaction.customId.split(':');
  await interaction.deferUpdate();

  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  if (!isTemporaryVoicePrivate(target.channel)) {
    await replySetVocError(
      interaction,
      '❌ La liste blanche est disponible uniquement quand le vocal est **Privé**.',
    );
    return;
  }

  whitelistRemoveDrafts.delete(
    whitelistDraftKey(interaction.guildId, channelId, interaction.user.id),
  );
  await showWhitelistPanel(interaction, channelId, target.ownerId, 0);
}

async function handleWhitelistRemoveSelect(interaction) {
  const [, , , channelId, rawPage] = interaction.customId.split(':');
  await interaction.deferUpdate();

  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  const removeKey = whitelistDraftKey(interaction.guildId, channelId, interaction.user.id);
  whitelistRemoveDrafts.set(removeKey, uniqueSnowflakes(interaction.values));
  await showWhitelistPanel(interaction, channelId, target.ownerId, Number(rawPage) || 0);
}

async function handleWhitelistRemoveButton(interaction) {
  const [, , , channelId, rawPage] = interaction.customId.split(':');
  await interaction.deferUpdate();

  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  if (!isTemporaryVoicePrivate(target.channel)) {
    await replySetVocError(
      interaction,
      '❌ La liste blanche est disponible uniquement quand le vocal est **Privé**.',
    );
    return;
  }

  const removeKey = whitelistDraftKey(interaction.guildId, channelId, interaction.user.id);
  const selectedIds = whitelistRemoveDrafts.get(removeKey) ?? [];
  if (!selectedIds.length) {
    await replySetVocError(interaction, '❌ Sélectionne au moins un membre à retirer.');
    return;
  }

  const currentIds = getTemporaryVoiceWhitelist(interaction.guildId, channelId);
  const removedIds = new Set(selectedIds);
  const updatedIds = await setTemporaryVoiceWhitelist(
    interaction.guildId,
    channelId,
    currentIds.filter((memberId) => !removedIds.has(memberId)),
  );

  await replacePermissionOverwritesFast(
    target.channel,
    buildPrivateVoiceOverwrites(interaction.guild, target.ownerId, updatedIds),
    `Membres retirés de la liste blanche par ${interaction.user.tag}`,
  );

  for (const removedId of removedIds) {
    const removedMember = target.channel.members.get(removedId);
    if (
      removedMember &&
      removedMember.id !== target.ownerId &&
      !removedMember.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      await removedMember.voice
        .disconnect('Retiré de la liste blanche du vocal privé')
        .catch(() => null);
    }
  }

  whitelistRemoveDrafts.delete(removeKey);
  await showWhitelistPanel(
    interaction,
    channelId,
    target.ownerId,
    Number(rawPage) || 0,
  );
}

async function handleWhitelistPageButton(interaction) {
  const [, , , direction, channelId, rawPage] = interaction.customId.split(':');
  await interaction.deferUpdate();

  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  whitelistRemoveDrafts.delete(
    whitelistDraftKey(interaction.guildId, channelId, interaction.user.id),
  );
  const currentPage = Number(rawPage) || 0;
  await showWhitelistPanel(
    interaction,
    channelId,
    target.ownerId,
    direction === 'next' ? currentPage + 1 : currentPage - 1,
  );
}

async function handleWhitelistBackButton(interaction) {
  const [, , , channelId] = interaction.customId.split(':');
  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  whitelistRemoveDrafts.delete(
    whitelistDraftKey(interaction.guildId, channelId, interaction.user.id),
  );
  await interaction.update(
    buildSetVocPanel(target.channel, target.ownerId, {
      allowedMemberIds: getTemporaryVoiceWhitelist(interaction.guildId, channelId),
      pendingMemberIds:
        whitelistAddDrafts.get(
          whitelistDraftKey(interaction.guildId, channelId, interaction.user.id),
        ) ?? [],
    }),
  );
}

function buildCustomLimitModal(channelId) {
  const input = new TextInputBuilder()
    .setCustomId('limit')
    .setLabel('Nombre maximum d’utilisateurs (1 à 99)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Exemple : 12')
    .setMinLength(1)
    .setMaxLength(2)
    .setRequired(true);

  return new ModalBuilder()
    .setCustomId(`setvoc:limitmodal:${channelId}`)
    .setTitle('Limite personnalisée')
    .addComponents(new ActionRowBuilder().addComponents(input));
}

async function handleSetVocLimitSelect(interaction) {
  const [, , channelId] = interaction.customId.split(':');
  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  const selectedValue = interaction.values[0];
  if (selectedValue === 'custom') {
    await interaction.showModal(buildCustomLimitModal(channelId));
    return;
  }

  const limit = Number(selectedValue);
  if (![0, 2, 3, 4, 5].includes(limit)) return;

  await target.channel.setUserLimit(limit, `Limite du vocal modifiée par ${interaction.user.tag}`);
  const refreshedChannel = await interaction.guild.channels.fetch(channelId);
  await interaction.update(
    buildSetVocPanel(refreshedChannel, target.ownerId, {
      allowedMemberIds: getTemporaryVoiceWhitelist(interaction.guildId, channelId),
      pendingMemberIds:
        whitelistAddDrafts.get(
          whitelistDraftKey(interaction.guildId, channelId, interaction.user.id),
        ) ?? [],
    }),
  );
}

async function handleSetVocLimitModal(interaction) {
  const [, , channelId] = interaction.customId.split(':');
  const target = await getSetVocTarget(interaction, channelId);
  if (!target) return;

  const rawValue = interaction.fields.getTextInputValue('limit').trim();
  if (!/^\d{1,2}$/.test(rawValue)) {
    await interaction.reply({
      content: '❌ Entre un nombre entier compris entre **1 et 99**.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const limit = Number(rawValue);
  if (limit < 1 || limit > 99) {
    await interaction.reply({
      content: '❌ La limite personnalisée doit être comprise entre **1 et 99**.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await target.channel.setUserLimit(limit, `Limite personnalisée par ${interaction.user.tag}`);
  const refreshedChannel = await interaction.guild.channels.fetch(channelId);

  if (interaction.isFromMessage()) {
    await interaction.update(buildSetVocPanel(refreshedChannel, target.ownerId));
  } else {
    await interaction.reply({
      content: `✅ La limite du vocal est maintenant de **${limit} utilisateurs**.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function handleSetupSelect(interaction) {
  const [, type, field, ownerId] = interaction.customId.split(':');
  if (!['captcha', 'welcome', 'voice', 'basicrole'].includes(type)) return;
  if (!(await ensureSetupOwner(interaction, ownerId))) return;

  const session = getSession(type, interaction.guildId, ownerId);
  if (!session) {
    await interaction.reply({
      content: '⌛ Cette configuration a expiré. Relance la commande.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const value = interaction.values[0];

  if (type === 'captcha') {
    if (field === 'channel') session.channelId = value;
    if (field === 'remove') session.removeRoleId = value;
    if (field === 'add') session.addRoleId = value;
    await interaction.update(buildCaptchaSetupPanel(session));
    return;
  }

  if (type === 'welcome') {
    session.channelId = value;
    await interaction.update(buildWelcomeSetupPanel(session));
    return;
  }

  if (type === 'voice') {
    session.categoryId = value;
    await interaction.update(buildVoiceSetupPanel(session));
    return;
  }

  if (type === 'basicrole') {
    session.roleId = value;
    await interaction.update(buildBasicRoleSetupPanel(session));
  }
}

async function handleSetupButton(interaction) {
  const [, type, action, ownerId] = interaction.customId.split(':');
  if (!['captcha', 'welcome', 'voice', 'basicrole'].includes(type)) return;
  if (!(await ensureSetupOwner(interaction, ownerId))) return;

  const session = getSession(type, interaction.guildId, ownerId);
  if (!session) {
    await interaction.reply({
      content: '⌛ Cette configuration a expiré. Relance la commande.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === 'cancel') {
    deleteSession(type, interaction.guildId, ownerId);
    await interaction.update({
      content: 'Configuration annulée.',
      embeds: [],
      components: [],
    });
    return;
  }

  if (action !== 'save') return;

  if (type === 'captcha') {
    await saveCaptchaSetup(interaction, session);
    return;
  }

  if (type === 'welcome') {
    await saveWelcomeSetup(interaction, session);
    return;
  }

  if (type === 'voice') {
    await saveVoiceSetup(interaction, session);
    return;
  }

  if (type === 'basicrole') {
    await saveBasicRoleSetup(interaction, session);
  }
}

async function saveCaptchaSetup(interaction, session) {
  if (!session.channelId || !session.removeRoleId || !session.addRoleId) {
    await interaction.reply({
      content: '❌ Choisis le salon et les deux rôles avant d’enregistrer.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (session.removeRoleId === session.addRoleId) {
    await interaction.reply({
      content: '❌ Le rôle à enlever et le rôle à ajouter doivent être différents.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const [channel, removeRole, addRole] = await Promise.all([
    interaction.guild.channels.fetch(session.channelId).catch(() => null),
    interaction.guild.roles.fetch(session.removeRoleId).catch(() => null),
    interaction.guild.roles.fetch(session.addRoleId).catch(() => null),
  ]);

  if (!channelCanReceiveMessages(channel, interaction.guild, { needsAttachments: true })) {
    await interaction.reply({
      content: '❌ Le bot ne peut pas envoyer de messages, d’images ou d’embed dans ce salon.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!roleCanBeManaged(removeRole, interaction.guild) || !roleCanBeManaged(addRole, interaction.guild)) {
    await interaction.reply({
      content:
        '❌ Le bot ne peut pas gérer l’un des rôles. Place son rôle au-dessus des deux rôles choisis et donne-lui la permission **Gérer les rôles**.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferUpdate();

  const previousConfig = store.getGuild(interaction.guildId).captcha;
  const panelMessage = await channel.send(verificationPanel(interaction.guild.name));

  await store.updateGuild(interaction.guildId, (guildConfig) => {
    guildConfig.captcha = {
      channelId: channel.id,
      removeRoleId: removeRole.id,
      addRoleId: addRole.id,
      panelMessageId: panelMessage.id,
    };
  });

  if (previousConfig?.panelMessageId && previousConfig.panelMessageId !== panelMessage.id) {
    const previousChannel = await interaction.guild.channels
      .fetch(previousConfig.channelId)
      .catch(() => null);
    if (previousChannel?.isTextBased()) {
      const previousMessage = await previousChannel.messages
        .fetch(previousConfig.panelMessageId)
        .catch(() => null);
      await previousMessage?.delete().catch(() => null);
    }
  }

  deleteSession('captcha', interaction.guildId, interaction.user.id);
  await interaction.editReply({
    content: `✅ Le panneau de vérification a été envoyé dans ${channel}.`,
    embeds: [],
    components: [],
  });
}

async function saveWelcomeSetup(interaction, session) {
  if (!session.channelId) {
    await interaction.reply({
      content: '❌ Choisis un salon avant d’enregistrer.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const channel = await interaction.guild.channels.fetch(session.channelId).catch(() => null);

  if (!channelCanReceiveMessages(channel, interaction.guild)) {
    await interaction.reply({
      content: '❌ Le bot ne peut pas envoyer de messages dans ce salon.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await store.updateGuild(interaction.guildId, (guildConfig) => {
    guildConfig.welcome = { channelId: channel.id };
  });

  deleteSession('welcome', interaction.guildId, interaction.user.id);
  await interaction.update({
    content: `✅ Les messages de bienvenue seront envoyés dans ${channel}.`,
    embeds: [],
    components: [],
  });
}

async function saveBasicRoleSetup(interaction, session) {
  if (!session.roleId) {
    await interaction.reply({
      content: '❌ Choisis un rôle avant d’enregistrer.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const role = await interaction.guild.roles.fetch(session.roleId).catch(() => null);

  if (!roleCanBeManaged(role, interaction.guild)) {
    await interaction.reply({
      content:
        '❌ Le bot ne peut pas gérer ce rôle. Place le rôle du bot au-dessus du rôle choisi et donne-lui la permission **Gérer les rôles**.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await store.updateGuild(interaction.guildId, (guildConfig) => {
    guildConfig.basicRole = { roleId: role.id };
  });

  deleteSession('basicrole', interaction.guildId, interaction.user.id);
  await interaction.update({
    content: `✅ Le rôle ${role} sera donné automatiquement aux nouveaux membres.`,
    embeds: [],
    components: [],
  });
}

async function saveVoiceSetup(interaction, session) {
  if (!session.categoryId) {
    await interaction.reply({
      content: '❌ Choisis une catégorie avant de créer le système.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const category = await interaction.guild.channels.fetch(session.categoryId).catch(() => null);
  const botMember = interaction.guild.members.me;

  if (!category || category.type !== ChannelType.GuildCategory) {
    await interaction.reply({
      content: '❌ La catégorie sélectionnée est introuvable.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const categoryPermissions = category.permissionsFor(botMember);
  if (
    !categoryPermissions?.has([
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.MoveMembers,
      PermissionFlagsBits.Connect,
    ])
  ) {
    await interaction.reply({
      content:
        '❌ Le bot a besoin des permissions **Voir les salons**, **Gérer les salons**, **Déplacer des membres** et **Se connecter** dans cette catégorie.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferUpdate();

  const previousVoiceConfig = store.getGuild(interaction.guildId).voice;
  const previousGenerator = previousVoiceConfig?.generatorChannelId
    ? await interaction.guild.channels.fetch(previousVoiceConfig.generatorChannelId).catch(() => null)
    : null;

  let generatorChannel = previousGenerator;
  if (!generatorChannel || generatorChannel.type !== ChannelType.GuildVoice) {
    generatorChannel = await interaction.guild.channels.create({
      name: '➕ Créer un vocal',
      type: ChannelType.GuildVoice,
      parent: category.id,
      reason: `Configuration des vocaux temporaires par ${interaction.user.tag}`,
    });
  } else if (generatorChannel.parentId !== category.id) {
    await generatorChannel.setParent(category.id, {
      lockPermissions: true,
      reason: `Déplacement du générateur vocal par ${interaction.user.tag}`,
    });
  }

  await store.updateGuild(interaction.guildId, (guildConfig) => {
    guildConfig.voice = {
      categoryId: category.id,
      generatorChannelId: generatorChannel.id,
      tempChannelIds: previousVoiceConfig?.tempChannelIds ?? [],
      tempChannelOwners: previousVoiceConfig?.tempChannelOwners ?? {},
      tempChannelWhitelists: previousVoiceConfig?.tempChannelWhitelists ?? {},
      tempChannelPrivateStates: previousVoiceConfig?.tempChannelPrivateStates ?? {},
    };
  });

  deleteSession('voice', interaction.guildId, interaction.user.id);
  await interaction.editReply({
    content: `✅ Le salon ${generatorChannel} est prêt dans la catégorie **${category.name}**.`,
    embeds: [],
    components: [],
  });
}

async function handleCaptchaStart(interaction) {
  if (!interaction.inGuild()) return;

  const config = store.getGuild(interaction.guildId).captcha;
  if (!config) {
    await interaction.reply({
      content: '❌ Le système de captcha n’est plus configuré.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const cooldownKey = `${interaction.guildId}:${interaction.user.id}`;
  const cooldownUntil = captchaCooldowns.get(cooldownKey) ?? 0;
  if (cooldownUntil > Date.now()) {
    const seconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
    await interaction.reply({
      content: `⏳ Attends encore ${seconds} seconde(s) avant de générer un nouveau captcha.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  captchaCooldowns.set(cooldownKey, Date.now() + CAPTCHA_COOLDOWN_MS);

  const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  if (!member) {
    await interaction.reply({
      content: '❌ Impossible de retrouver ton profil sur le serveur.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (member.roles.cache.has(config.addRoleId) && !member.roles.cache.has(config.removeRoleId)) {
    await interaction.reply({
      content: '✅ Tu es déjà vérifié.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  for (const [existingNonce, existingCaptcha] of activeCaptchas) {
    if (
      existingCaptcha.guildId === interaction.guildId &&
      existingCaptcha.userId === interaction.user.id
    ) {
      activeCaptchas.delete(existingNonce);
    }
  }

  const code = createCaptchaCode();
  const nonce = createNonce();
  const image = createCaptchaImage(code);

  activeCaptchas.set(nonce, {
    guildId: interaction.guildId,
    userId: interaction.user.id,
    code,
    attempts: 0,
    expiresAt: Date.now() + CAPTCHA_TTL_MS,
  });

  const attachment = new AttachmentBuilder(image, { name: 'captcha.png' });
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Recopie le code')
    .setDescription(
      `Tu as **${MAX_CAPTCHA_ATTEMPTS} essais**. Le code ne contient ni zéro, ni O, ni I, ni 1.`,
    )
    .setImage('attachment://captcha.png')
    .setFooter({ text: 'Expiration dans 2 minutes.' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`captcha:answer:${nonce}`)
      .setLabel('Saisir le code')
      .setEmoji('⌨️')
      .setStyle(ButtonStyle.Primary),
  );

  await interaction.reply({
    embeds: [embed],
    files: [attachment],
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleCaptchaAnswerButton(interaction) {
  const [, , nonce] = interaction.customId.split(':');
  const captcha = activeCaptchas.get(nonce);

  if (
    !captcha ||
    captcha.expiresAt < Date.now() ||
    captcha.guildId !== interaction.guildId ||
    captcha.userId !== interaction.user.id
  ) {
    activeCaptchas.delete(nonce);
    await interaction.reply({
      content: '⌛ Ce captcha a expiré. Clique de nouveau sur **Se vérifier**.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const input = new TextInputBuilder()
    .setCustomId('captcha_code')
    .setLabel('Code visible sur l’image')
    .setPlaceholder('Exemple : A7K9PD')
    .setStyle(TextInputStyle.Short)
    .setMinLength(6)
    .setMaxLength(6)
    .setRequired(true);

  const modal = new ModalBuilder()
    .setCustomId(`captcha:modal:${nonce}`)
    .setTitle('Vérification KI | Vlr')
    .addComponents(new ActionRowBuilder().addComponents(input));

  await interaction.showModal(modal);
}

async function handleCaptchaModal(interaction) {
  const [, , nonce] = interaction.customId.split(':');
  const captcha = activeCaptchas.get(nonce);

  if (
    !captcha ||
    captcha.expiresAt < Date.now() ||
    captcha.guildId !== interaction.guildId ||
    captcha.userId !== interaction.user.id
  ) {
    activeCaptchas.delete(nonce);
    await interaction.reply({
      content: '⌛ Ce captcha a expiré. Recommence la vérification.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const answer = interaction.fields
    .getTextInputValue('captcha_code')
    .trim()
    .toUpperCase();

  if (answer !== captcha.code) {
    captcha.attempts += 1;
    const remaining = MAX_CAPTCHA_ATTEMPTS - captcha.attempts;

    if (remaining <= 0) {
      activeCaptchas.delete(nonce);
      await interaction.reply({
        content: '❌ Trop de réponses incorrectes. Génère un nouveau captcha.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      content: `❌ Code incorrect. Il te reste **${remaining} essai(s)**. Referme ce message puis reclique sur **Saisir le code** sous l’image.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const config = store.getGuild(interaction.guildId).captcha;
  if (!config) {
    activeCaptchas.delete(nonce);
    await interaction.reply({
      content: '❌ La configuration du captcha a été supprimée.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const [member, removeRole, addRole] = await Promise.all([
    interaction.guild.members.fetch(interaction.user.id).catch(() => null),
    interaction.guild.roles.fetch(config.removeRoleId).catch(() => null),
    interaction.guild.roles.fetch(config.addRoleId).catch(() => null),
  ]);

  if (!member || !roleCanBeManaged(removeRole, interaction.guild) || !roleCanBeManaged(addRole, interaction.guild)) {
    activeCaptchas.delete(nonce);
    await interaction.editReply(
      '❌ Les rôles sont introuvables ou le bot ne peut plus les gérer. Contacte un administrateur.',
    );
    return;
  }

  try {
    if (!member.roles.cache.has(addRole.id)) {
      await member.roles.add(addRole, 'Captcha réussi');
    }

    if (member.roles.cache.has(removeRole.id)) {
      await member.roles.remove(removeRole, 'Captcha réussi');
    }

    activeCaptchas.delete(nonce);
    await interaction.editReply('✅ Vérification réussie ! Tes rôles ont été mis à jour.');
  } catch (error) {
    console.error('Erreur pendant la modification des rôles :', error);
    await interaction.editReply(
      '❌ Impossible de modifier tes rôles. Vérifie la hiérarchie des rôles du bot.',
    );
  }
}

const PRIVATE_VOICE_SUFFIX = ' (Private)';

function cleanVoiceChannelName(displayName) {
  const cleaned = displayName
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 82);

  return `Vocal de ${cleaned || 'membre'}`;
}

function temporaryVoiceNameForVisibility(channelName, isPrivate) {
  const baseName = channelName.endsWith(PRIVATE_VOICE_SUFFIX)
    ? channelName.slice(0, -PRIVATE_VOICE_SUFFIX.length)
    : channelName;

  if (!isPrivate) return baseName.slice(0, 100);

  return `${baseName.slice(0, 100 - PRIVATE_VOICE_SUFFIX.length)}${PRIVATE_VOICE_SUFFIX}`;
}

function scheduleTemporaryVoiceNameSync(channel, isPrivate) {
  let state = voiceRenameStates.get(channel.id);
  if (!state) {
    state = {
      channelId: channel.id,
      guildId: channel.guild.id,
      desiredPrivate: Boolean(isPrivate),
      timestamps: [],
      timer: null,
      running: false,
    };
    voiceRenameStates.set(channel.id, state);
  }

  state.desiredPrivate = Boolean(isPrivate);
  void runTemporaryVoiceNameSync(state);
}

async function runTemporaryVoiceNameSync(state) {
  if (state.running || state.timer) return;

  const guild = client.guilds.cache.get(state.guildId);
  const channel =
    guild?.channels.cache.get(state.channelId) ??
    (await guild?.channels.fetch(state.channelId).catch(() => null));

  if (!channel || channel.type !== ChannelType.GuildVoice) {
    voiceRenameStates.delete(state.channelId);
    return;
  }

  const desiredName = temporaryVoiceNameForVisibility(channel.name, state.desiredPrivate);
  if (channel.name === desiredName) return;

  const now = Date.now();
  state.timestamps = state.timestamps.filter(
    (timestamp) => now - timestamp < VOICE_RENAME_WINDOW_MS,
  );

  if (state.timestamps.length >= VOICE_RENAME_MAX_CHANGES) {
    const waitMs = Math.max(1_000, state.timestamps[0] + VOICE_RENAME_WINDOW_MS - now + 1_000);
    state.timer = setTimeout(() => {
      state.timer = null;
      void runTemporaryVoiceNameSync(state);
    }, waitMs);
    state.timer.unref();
    return;
  }

  state.running = true;
  state.timestamps.push(now);

  try {
    await channel.setName(
      desiredName,
      `Synchronisation du nom du vocal (${state.desiredPrivate ? 'privé' : 'public'})`,
    );
  } catch (error) {
    console.error(`Impossible de synchroniser immédiatement le nom du vocal ${channel.id} :`, error);
  } finally {
    state.running = false;

    const latestChannel =
      guild?.channels.cache.get(state.channelId) ??
      (await guild?.channels.fetch(state.channelId).catch(() => null));
    if (!latestChannel) {
      voiceRenameStates.delete(state.channelId);
      return;
    }

    const latestDesiredName = temporaryVoiceNameForVisibility(
      latestChannel.name,
      state.desiredPrivate,
    );
    if (latestChannel.name !== latestDesiredName) {
      void runTemporaryVoiceNameSync(state);
    }
  }
}

async function addTemporaryVoiceChannel(guildId, channelId, ownerId) {
  await store.updateGuild(guildId, (guildConfig) => {
    if (!guildConfig.voice) return;
    const ids = new Set(guildConfig.voice.tempChannelIds ?? []);
    ids.add(channelId);
    guildConfig.voice.tempChannelIds = [...ids];
    guildConfig.voice.tempChannelOwners = guildConfig.voice.tempChannelOwners ?? {};
    guildConfig.voice.tempChannelOwners[channelId] = ownerId;
    guildConfig.voice.tempChannelWhitelists = guildConfig.voice.tempChannelWhitelists ?? {};
    guildConfig.voice.tempChannelWhitelists[channelId] = [];
    guildConfig.voice.tempChannelPrivateStates =
      guildConfig.voice.tempChannelPrivateStates ?? {};
    guildConfig.voice.tempChannelPrivateStates[channelId] = false;
  });
}

async function removeTemporaryVoiceChannel(guildId, channelId) {
  clearWhitelistDraftsForChannel(guildId, channelId);

  await store.updateGuild(guildId, (guildConfig) => {
    if (!guildConfig.voice) return;
    guildConfig.voice.tempChannelIds = (guildConfig.voice.tempChannelIds ?? []).filter(
      (id) => id !== channelId,
    );
    guildConfig.voice.tempChannelOwners = guildConfig.voice.tempChannelOwners ?? {};
    delete guildConfig.voice.tempChannelOwners[channelId];
    guildConfig.voice.tempChannelWhitelists = guildConfig.voice.tempChannelWhitelists ?? {};
    delete guildConfig.voice.tempChannelWhitelists[channelId];
    guildConfig.voice.tempChannelPrivateStates =
      guildConfig.voice.tempChannelPrivateStates ?? {};
    delete guildConfig.voice.tempChannelPrivateStates[channelId];
  });

  const renameState = voiceRenameStates.get(channelId);
  if (renameState?.timer) clearTimeout(renameState.timer);
  voiceRenameStates.delete(channelId);
}

async function createTemporaryVoiceForMember(newState, voiceConfig) {
  const member = newState.member;
  if (!member || member.user.bot) return;

  const lockKey = `${newState.guild.id}:${member.id}`;
  if (voiceCreationLocks.has(lockKey)) return;
  voiceCreationLocks.add(lockKey);

  let temporaryChannel = null;

  try {
    const category = await newState.guild.channels.fetch(voiceConfig.categoryId).catch(() => null);
    if (!category || category.type !== ChannelType.GuildCategory) return;

    temporaryChannel = await newState.guild.channels.create({
      name: cleanVoiceChannelName(member.displayName),
      type: ChannelType.GuildVoice,
      parent: category.id,
      reason: `Vocal temporaire créé pour ${member.user.tag}`,
    });

    await addTemporaryVoiceChannel(newState.guild.id, temporaryChannel.id, member.id);
    await member.voice.setChannel(temporaryChannel, 'Création automatique du vocal temporaire');
  } catch (error) {
    console.error(`Impossible de créer/déplacer le vocal de ${member.user.tag} :`, error);

    if (temporaryChannel) {
      await temporaryChannel.delete('Échec du déplacement du membre').catch(() => null);
      await removeTemporaryVoiceChannel(newState.guild.id, temporaryChannel.id).catch(() => null);
    }
  } finally {
    voiceCreationLocks.delete(lockKey);
  }
}

async function deleteTemporaryVoiceIfEmpty(guild, channelId) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const voiceConfig = store.getGuild(guild.id).voice;
  if (!voiceConfig?.tempChannelIds?.includes(channelId)) return;

  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel) {
    await removeTemporaryVoiceChannel(guild.id, channelId);
    return;
  }

  if (channel.type === ChannelType.GuildVoice && channel.members.size === 0) {
    await channel.delete('Vocal temporaire vide').catch((error) => {
      console.error(`Impossible de supprimer le vocal temporaire ${channel.id} :`, error);
    });

    await removeTemporaryVoiceChannel(guild.id, channelId);
  }
}

async function cleanupTemporaryVoiceChannels() {
  for (const guild of client.guilds.cache.values()) {
    const voiceConfig = store.getGuild(guild.id).voice;
    if (!voiceConfig?.tempChannelIds?.length) continue;

    for (const channelId of [...voiceConfig.tempChannelIds]) {
      const channel = await guild.channels.fetch(channelId).catch(() => null);

      if (!channel) {
        await removeTemporaryVoiceChannel(guild.id, channelId);
        continue;
      }

      if (channel.type === ChannelType.GuildVoice && channel.members.size === 0) {
        await channel.delete('Nettoyage au démarrage : vocal temporaire vide').catch(() => null);
        await removeTemporaryVoiceChannel(guild.id, channelId);
      }
    }
  }
}

async function handleMapRouletteCommand(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: '❌ Cette commande peut uniquement être utilisée dans un serveur.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const selectedMap = VALORANT_MAPS[crypto.randomInt(0, VALORANT_MAPS.length)];

  const embed = new EmbedBuilder()
    .setColor(0xff4655)
    .setTitle('🎲 Map Roulette')
    .setDescription(`La map tirée au sort est :\n\n# **${selectedMap}**`)
    .setFooter({ text: `${VALORANT_MAPS.length} maps possibles • ${BRAND}` });

  await interaction.reply({ embeds: [embed] });
}


client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Connecté en tant que ${readyClient.user.tag}.`);
  console.log(`Stockage de configuration actif : ${CONFIG_PATH}`);

  readyClient.user.setPresence({
    status: 'online',
    activities: [
      {
        name: BRAND,
        type: ActivityType.Custom,
        state: 'Version 1.3.0',
      },
    ],
  });

  await cleanupTemporaryVoiceChannels();
});

client.on(Events.GuildMemberAdd, async (member) => {
  const guildConfig = store.getGuild(member.guild.id);

  if (!member.user.bot && guildConfig.basicRole?.roleId) {
    const basicRole = await member.guild.roles.fetch(guildConfig.basicRole.roleId).catch(() => null);

    if (roleCanBeManaged(basicRole, member.guild) && !member.roles.cache.has(basicRole.id)) {
      await member.roles.add(basicRole, 'Rôle basique attribué à l’arrivée').catch((error) => {
        console.error(`Impossible d’attribuer le rôle basique à ${member.user.tag} :`, error);
      });
    }
  }

  if (!member.user.bot && guildConfig.captcha?.removeRoleId) {
    const unverifiedRole = await member.guild.roles
      .fetch(guildConfig.captcha.removeRoleId)
      .catch(() => null);

    if (roleCanBeManaged(unverifiedRole, member.guild) && !member.roles.cache.has(unverifiedRole.id)) {
      await member.roles.add(unverifiedRole, 'Rôle attribué en attente du captcha').catch((error) => {
        console.error(`Impossible d’attribuer le rôle non vérifié à ${member.user.tag} :`, error);
      });
    }
  }

  const welcomeConfig = guildConfig.welcome;
  if (!welcomeConfig?.channelId) return;

  const channel = await member.guild.channels.fetch(welcomeConfig.channelId).catch(() => null);
  if (!channel?.isTextBased()) return;

  await channel
    .send({
      content: `Bienvenue à ${member} sur ${BRAND} !`,
      allowedMentions: { users: [member.id] },
    })
    .catch((error) => {
      console.error(`Impossible d’envoyer le message de bienvenue sur ${member.guild.name} :`, error);
    });
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (oldState.channelId === newState.channelId) return;

  const voiceConfig = store.getGuild(newState.guild.id).voice;
  if (!voiceConfig) return;

  if (newState.channelId === voiceConfig.generatorChannelId) {
    await createTemporaryVoiceForMember(newState, voiceConfig);
  }

  if (oldState.channelId && voiceConfig.tempChannelIds?.includes(oldState.channelId)) {
    await deleteTemporaryVoiceIfEmpty(oldState.guild, oldState.channelId);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'setvoc') {
        await handleSetVocCommand(interaction);
      } else if (interaction.commandName === 'maproulette') {
        await handleMapRouletteCommand(interaction);
      } else {
        await handleAdminCommand(interaction);
      }
      return;
    }

    if (interaction.isUserSelectMenu()) {
      if (interaction.customId.startsWith('setvoc:whitelist:addselect:')) {
        await handleWhitelistAddSelect(interaction);
      }
      return;
    }

    if (interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu()) {
      if (interaction.customId.startsWith('setup:')) {
        await handleSetupSelect(interaction);
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('setvoc:limit:')) {
        await handleSetVocLimitSelect(interaction);
      } else if (interaction.customId.startsWith('setvoc:whitelist:removeselect:')) {
        await handleWhitelistRemoveSelect(interaction);
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId.startsWith('setvoc:whitelist:add:')) {
        await handleWhitelistAddButton(interaction);
        return;
      }

      if (interaction.customId.startsWith('setvoc:whitelist:list:')) {
        await handleWhitelistListButton(interaction);
        return;
      }

      if (interaction.customId.startsWith('setvoc:whitelist:remove:')) {
        await handleWhitelistRemoveButton(interaction);
        return;
      }

      if (interaction.customId.startsWith('setvoc:whitelist:page:')) {
        await handleWhitelistPageButton(interaction);
        return;
      }

      if (interaction.customId.startsWith('setvoc:whitelist:back:')) {
        await handleWhitelistBackButton(interaction);
        return;
      }

      if (interaction.customId.startsWith('setvoc:visibility:')) {
        await handleSetVocVisibilityButton(interaction);
        return;
      }

      if (interaction.customId.startsWith('setup:')) {
        await handleSetupButton(interaction);
        return;
      }

      if (interaction.customId === 'captcha:start') {
        await handleCaptchaStart(interaction);
        return;
      }

      if (interaction.customId.startsWith('captcha:answer:')) {
        await handleCaptchaAnswerButton(interaction);
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('setvoc:limitmodal:')) {
        await handleSetVocLimitModal(interaction);
        return;
      }

      if (interaction.customId.startsWith('captcha:modal:')) {
        await handleCaptchaModal(interaction);
      }
    }
  } catch (error) {
    console.error('Erreur pendant une interaction :', error);

    const payload = {
      content: '❌ Une erreur inattendue est survenue. Consulte la console du bot.',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => null);
    } else {
      await interaction.reply(payload).catch(() => null);
    }
  }
});

setInterval(() => {
  const now = Date.now();

  for (const [key, session] of setupSessions) {
    if (session.expiresAt < now) setupSessions.delete(key);
  }

  for (const [nonce, captcha] of activeCaptchas) {
    if (captcha.expiresAt < now) activeCaptchas.delete(nonce);
  }

  for (const [key, expiresAt] of captchaCooldowns) {
    if (expiresAt < now) captchaCooldowns.delete(key);
  }

}, 60_000).unref();

async function shutdown(signal) {
  console.log(`${signal} reçu : sauvegarde de la configuration avant arrêt.`);
  await store.save().catch((error) => {
    console.error('Impossible de sauvegarder la configuration avant arrêt :', error);
  });
  client.destroy();
  process.exit(0);
}

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('unhandledRejection', (error) => {
  console.error('Promesse rejetée non gérée :', error);
});

process.on('uncaughtException', (error) => {
  console.error('Exception non gérée :', error);
  process.exit(1);
});

if (require.main === module) {
  client.login(token);
}

module.exports = {
  ConfigStore,
  buildBasicRoleSetupPanel,
  buildCaptchaSetupPanel,
  buildPrivateVoiceOverwrites,
  buildSetVocPanel,
  buildSyncedVoiceOverwrites,
  buildWhitelistPanel,
  replacePermissionOverwritesFast,
  buildVoiceSetupPanel,
  buildWelcomeSetupPanel,
  cleanVoiceChannelName,
  createCaptchaCode,
  createCaptchaImage,
  encodePng,
  formatVoiceLimit,
  getTemporaryVoiceWhitelist,
  isTemporaryVoicePrivate,
  setTemporaryVoicePrivateState,
  temporaryVoiceNameForVisibility,
  uniqueSnowflakes,
  verificationPanel,
};
