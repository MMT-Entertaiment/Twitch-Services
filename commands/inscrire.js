const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getStreamers, addStreamer } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inscrire')
    .setDescription('Inscrire un streameur Twitch')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('pseudo').setDescription('Pseudo Twitch du streameur').setRequired(true)),

  async execute(interaction) {
    const login = interaction.options.getString('pseudo').toLowerCase().trim();
    const streamers = getStreamers();
    if (streamers[login]) {
      return interaction.reply({ content: `❌ **${login}** est déjà inscrit.`, ephemeral: true });
    }
    addStreamer(login, interaction.guildId, interaction.user.id);
    await interaction.reply({ content: `✅ **${login}** inscrit !` });
  },
};
