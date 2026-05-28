const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getStreamers, removeStreamer } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('desinscrire')
    .setDescription('Désinscrire un streameur Twitch')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('pseudo').setDescription('Pseudo Twitch du streameur').setRequired(true)),

  async execute(interaction) {
    const login = interaction.options.getString('pseudo').toLowerCase().trim();
    const streamers = getStreamers();
    if (!streamers[login]) {
      return interaction.reply({ content: `❌ **${login}** n'est pas inscrit.`, ephemeral: true });
    }
    removeStreamer(login);
    await interaction.reply({ content: `✅ **${login}** désinscrit !` });
  },
};
