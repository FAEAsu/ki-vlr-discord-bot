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
      .setDescription('Configure le rôle attribué automatiquement aux nouveaux membres.')
      .setDefaultMemberPermissions(adminOnly)
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('maproulette')
      .setDescription('Tire aléatoirement une map de VALORANT.')
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('teamcreate')
      .setDescription('Crée une équipe temporaire pour le tournoi.')
      .addStringOption((option) =>
        option
          .setName('nom')
          .setDescription('Nom ou numéro de l’équipe, par exemple 1 ou Team Alpha.')
          .setRequired(true)
          .setMaxLength(70),
      )
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('teamadd')
      .setDescription('Ajoute un ou plusieurs joueurs à une équipe.')
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('teamsee')
      .setDescription('Affiche toutes les équipes et leurs joueurs.')
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('myteam')
      .setDescription('Affiche ton équipe actuelle.')
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('tournoistart')
      .setDescription('Démarre le tournoi et crée les salons vocaux.')
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('tournoipermconfig')
      .setDescription('Configure les rôles autorisés à utiliser les commandes tournoi.')
      .setDefaultMemberPermissions(adminOnly)
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('tournoiend')
      .setDescription('Termine le tournoi et supprime ses équipes, rôles et salons.')
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('unban')
      .setDescription('Ouvre le panneau de débannissement.')
      .setDMPermission(false),

    new SlashCommandBuilder()
      .setName('servlist')
      .setDescription('Affiche les serveurs où le bot est présent.')
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
      'DISCORD_TOKEN et CLIENT_ID doivent être renseignés dans les variables d’environnement.',
    );
  }

  if (!mainGuildId) {
    throw new Error(
      'GUILD_ID doit contenir l’identifiant de ton serveur principal.',
    );
  }

  const commands = buildCommands();

  const rest = new REST({
    version: '10',
  }).setToken(token);

  console.log('========================================');
  console.log(`Commandes à déployer : ${commands.length}`);
  console.log(`Serveurs ciblés : ${uniqueGuildIds.length}`);
  console.log('========================================');

  for (const guildId of uniqueGuildIds) {
    try {
      console.log(
        `Déploiement des commandes sur le serveur ${guildId}...`,
      );

      const data = await rest.put(
        Routes.applicationGuildCommands(
          clientId,
          guildId,
        ),
        {
          body: commands,
        },
      );

      console.log(
        `✅ ${data.length} commande(s) déployée(s) sur ${guildId}.`,
      );
    } catch (error) {
      console.error(
        `❌ Impossible de déployer les commandes sur ${guildId} :`,
        error,
      );
    }
  }

  console.log('========================================');
  console.log('Déploiement des commandes terminé.');
  console.log('========================================');
}

if (require.main === module) {
  deployCommands().catch((error) => {
    console.error(
      'Impossible de déployer les commandes :',
      error,
    );

    process.exitCode = 1;
  });
}

module.exports = {
  buildCommands,
  deployCommands,
};
