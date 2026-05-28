const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setConfig, getConfig } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configurer le bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('notif-salon')
        .setDescription('Définir le salon pour les notifications Twitch')
        .addChannelOption(o =>
          o.setName('salon').setDescription('Salon de notification').setRequired(true))),

  async execute(interaction) {
    const channel = interaction.options.getChannel('salon');
    setConfig(interaction.guildId, { notifChannelId: channel.id });
    await interaction.reply({
      content: `✅ Notifications Twitch dans <#${channel.id}>`,
      ephemeral: true,
    });
  },
};
