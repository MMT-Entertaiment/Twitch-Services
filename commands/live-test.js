const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('live-test')
    .setDescription('Tester le message de notification Twitch')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('pseudo').setDescription('Pseudo à simuler (optionnel)').setRequired(false)),

  async execute(interaction) {
    const config = getConfig(interaction.guildId);
    if (!config.notifChannelId) {
      return interaction.reply({ content: '❌ Aucun salon configuré. Utilise `/config notif-salon`.', ephemeral: true });
    }
    const channel = await interaction.client.channels.fetch(config.notifChannelId).catch(() => null);
    if (!channel) {
      return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });
    }
    const login = interaction.options.getString('pseudo') || 'twitch_user_name';
    await channel.send(`Bonjour @everyone ! notre incroyable <@&1508428118581575791>, **${login}** à lancé un Live Steam sur Twitch clique ici pour aller sur le [Stream](https://twitch.tv)`);
    await interaction.reply({ content: `✅ Test envoyé dans <#${config.notifChannelId}>`, ephemeral: true });
  },
};
