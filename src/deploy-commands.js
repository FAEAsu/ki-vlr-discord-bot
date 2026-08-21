const {
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');

function buildCommands() {
  const adminOnly = PermissionFlagsBits.Administrator;

  return [
    new SlashCommandBuilder()
      .setName('captcha')
      .setDescription('Configure le panneau de vérification par captcha.')
      .setDefaultMemberPermissions(adminOnly)
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('welcome')
      .setDescription('Configure le salon des messages de bienvenue.')
      .setDefaultMemberPermissions(adminOnly)
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('voc')
      .setDescription('Configure la création automatique de vocaux temporaires.')
      .setDefaultMemberPermissions(adminOnly)
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('setvoc')
      .setDescription('Paramétrez votre salon vocal.')
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('rolebasique')
      .setDescription(
        'Configure le rôle attribué automatiquement aux nouveaux membres.',
      )
      .setDefaultMemberPermissions(adminOnly)
      .setDMPermission(false),
  ].map((command) => command.toJSON());
}

async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const mainGuildId = process.env.GUILD_ID?.trim();

  const guildIds = [
    mainGuildId,
    '1540134336588947647',
  ].filter(Boolean);

  const uniqueGuildIds = [...new Set(guildIds)];

  if (!token || !clientId) {
    throw new Error(
      'DISCORD_TOKEN et CLIENT_ID doivent être renseignés dans le fichier .env.',
    );
  }

  if (!mainGuildId) {
    throw new Error(
      'GUILD_ID doit contenir l’identifiant de ton serveur principal.',
    );
  }

  const commands = buildCommands();
  const rest = new REST({ version: '10' }).setToken(token);

  for (const guildId of uniqueGuildIds) {
    console.log(`Déploiement des commandes sur le serveur ${guildId}...`);

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      {
        body: commands,
      },
    );

    console.log(
      `${data.length} commande(s) déployée(s) sur ${guildId} avec succès.`,
    );
  }

  console.log('Déploiement terminé sur tous les serveurs.');
}

if (require.main === module) {
  deployCommands().catch((error) => {
    console.error('Impossible de déployer les commandes :', error);
    process.exitCode = 1;
  });
}

module.exports = {
  buildCommands,
  deployCommands,
};