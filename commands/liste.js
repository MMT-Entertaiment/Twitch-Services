const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStreamers } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('liste')
    .setDescription('Lister les streameurs inscrits'),

  async execute(interaction) {
    const streamers = getStreamers();
    const guild = Object.entries(streamers).filter(([, v]) => v.guildId === interaction.guildId);
    if (guild.length === 0) {
      return interaction.reply({ content: '📋 Aucun streameur inscrit.', ephemeral: true });
    }
    const lines = guild.map(([login, info]) =>
      `• **[${login}](https://twitch.tv/${login})** — ${info.isLive ? '🔴 En live' : '⚫ Hors ligne'}`
    );
    const embed = new EmbedBuilder()
      .setColor(0x9146ff)
      .setTitle('📋 Streameurs inscrits')
      .setDescription(lines.join('\n'))
      .setFooter({ text: `${guild.length} streameur(s)` })
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
