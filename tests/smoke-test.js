const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');

const {
  buildBasicRoleSetupPanel,
  buildCaptchaSetupPanel,
  buildPrivateVoiceOverwrites,
  buildSetVocPanel,
  buildWhitelistPanel,
  buildVoiceSetupPanel,
  buildWelcomeSetupPanel,
  cleanVoiceChannelName,
  createCaptchaCode,
  createCaptchaImage,
  formatVoiceLimit,
  isTemporaryVoicePrivate,
  temporaryVoiceNameForVisibility,
  uniqueSnowflakes,
  verificationPanel,
} = require('../src/index');
const { buildCommands } = require('../src/deploy-commands');

const code = createCaptchaCode();
assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);

const png = createCaptchaImage(code);
assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
assert.ok(png.length > 1_000);
assert.equal(cleanVoiceChannelName('  Test\nUser  '), 'Vocal de Test User');
assert.ok(cleanVoiceChannelName('a'.repeat(200)).length <= 91);
assert.equal(formatVoiceLimit(0), 'Aucune limite');
assert.equal(formatVoiceLimit(12), '12 utilisateur(s)');
assert.equal(temporaryVoiceNameForVisibility('Vocal de Test User', true), 'Vocal de Test User (Private)');
assert.equal(temporaryVoiceNameForVisibility('Vocal de Test User (Private)', true), 'Vocal de Test User (Private)');
assert.equal(temporaryVoiceNameForVisibility('Vocal de Test User (Private)', false), 'Vocal de Test User');
assert.ok(temporaryVoiceNameForVisibility('Vocal de ' + 'a'.repeat(100), true).length <= 100);

const session = {
  ownerId: '123456789012345678',
  channelId: '223456789012345678',
  removeRoleId: '323456789012345678',
  addRoleId: '423456789012345678',
  categoryId: '523456789012345678',
  roleId: '623456789012345678',
};

const publicVoiceChannel = {
  id: '723456789012345678',
  name: 'Vocal de Test User',
  userLimit: 4,
  guild: { id: '823456789012345678' },
  permissionOverwrites: { cache: new Map() },
};

const privateVoiceChannel = {
  ...publicVoiceChannel,
  name: 'Vocal de Test User (Private)',
  permissionOverwrites: {
    cache: new Map([
      [
        publicVoiceChannel.guild.id,
        { deny: { has: (permission) => permission === PermissionFlagsBits.ViewChannel } },
      ],
    ]),
  },
};

assert.equal(isTemporaryVoicePrivate(publicVoiceChannel), false);
assert.equal(isTemporaryVoicePrivate(privateVoiceChannel), true);

assert.deepEqual(
  uniqueSnowflakes([
    '123456789012345678',
    '123456789012345678',
    'not-an-id',
    '223456789012345678',
  ]),
  ['123456789012345678', '223456789012345678'],
);

const mockGuild = {
  roles: { everyone: { id: '823456789012345678' } },
  members: { me: { id: '923456789012345678' } },
};
const privateOverwrites = buildPrivateVoiceOverwrites(
  mockGuild,
  '123456789012345678',
  ['223456789012345678', '323456789012345678'],
);
assert.deepEqual(
  privateOverwrites.map((overwrite) => overwrite.id),
  [
    '823456789012345678',
    '123456789012345678',
    '223456789012345678',
    '323456789012345678',
    '923456789012345678',
  ],
);

for (const payload of [
  buildBasicRoleSetupPanel(session),
  buildCaptchaSetupPanel(session),
  buildSetVocPanel(publicVoiceChannel, session.ownerId),
  buildSetVocPanel(privateVoiceChannel, session.ownerId, {
    allowedMemberIds: ['223456789012345678'],
    pendingMemberIds: ['323456789012345678'],
  }),
  buildWhitelistPanel(
    privateVoiceChannel,
    session.ownerId,
    [
      {
        id: '223456789012345678',
        displayName: 'Membre Test',
        user: { username: 'membre_test' },
      },
    ],
    0,
    ['223456789012345678'],
  ),
  buildWelcomeSetupPanel(session),
  buildVoiceSetupPanel(session),
  verificationPanel(),
]) {
  assert.ok(payload.embeds.length > 0);
  assert.ok(payload.components.length > 0);
  payload.embeds.forEach((embed) => embed.toJSON());
  payload.components.forEach((component) => component.toJSON());
}


const publicSetVocPanel = buildSetVocPanel(publicVoiceChannel, session.ownerId);
const privateSetVocPanel = buildSetVocPanel(privateVoiceChannel, session.ownerId, {
  allowedMemberIds: ['223456789012345678'],
  pendingMemberIds: ['323456789012345678'],
});
assert.equal(publicSetVocPanel.components.length, 2);
assert.equal(privateSetVocPanel.components.length, 4);
assert.equal(privateSetVocPanel.components[2].toJSON().components[0].type, 5);

const whitelistPanel = buildWhitelistPanel(
  privateVoiceChannel,
  session.ownerId,
  [
    {
      id: '223456789012345678',
      displayName: 'Membre Test',
      user: { username: 'membre_test' },
    },
  ],
  0,
  ['223456789012345678'],
);
assert.equal(whitelistPanel.components.length, 2);
assert.equal(whitelistPanel.components[0].toJSON().components[0].options.length, 1);

const commands = buildCommands();
assert.deepEqual(
  commands.map((command) => command.name),
  ['captcha', 'welcome', 'voc', 'setvoc', 'rolebasique'],
);

for (const command of commands.filter((command) => command.name !== 'setvoc')) {
  assert.equal(command.default_member_permissions, PermissionFlagsBits.Administrator.toString());
  assert.equal(command.dm_permission, false);
}

const setVocCommand = commands.find((command) => command.name === 'setvoc');
assert.equal(setVocCommand.default_member_permissions, undefined);
assert.equal(setVocCommand.dm_permission, false);

console.log('Tests réussis : commandes, panneaux, liste blanche /setvoc, rôle basique et captcha PNG.');
