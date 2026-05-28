const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Faire dire quelque chose au bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(o => o.setName('texte').setDescription('Message simple à envoyer').setRequired(false))
    .addStringOption(o => o.setName('titre').setDescription('[Embed] Titre').setRequired(false))
    .addStringOption(o => o.setName('description').setDescription('[Embed] Description').setRequired(false))
    .addStringOption(o => o.setName('couleur').setDescription('[Embed] Couleur hex (ex: #5865f2)').setRequired(false))
    .addStringOption(o => o.setName('footer').setDescription('[Embed] Texte du footer').setRequired(false))
    .addStringOption(o => o.setName('image').setDescription('[Embed ou seul] URL de l\'image').setRequired(false))
    .addStringOption(o => o.setName('thumbnail').setDescription('[Embed] URL de la miniature').setRequired(false))
    .addStringOption(o => o.setName('auteur').setDescription('[Embed] Nom de l\'auteur').setRequired(false)),

  async execute(interaction) {
    const texte     = interaction.options.getString('texte');
    const titre     = interaction.options.getString('titre');
    const desc      = interaction.options.getString('description');
    const couleur   = interaction.options.getString('couleur');
    const footer    = interaction.options.getString('footer');
    const image     = interaction.options.getString('image');
    const thumbnail = interaction.options.getString('thumbnail');
    const auteur    = interaction.options.getString('auteur');

    const hasEmbed = titre || desc || couleur || footer || thumbnail || auteur;

    if (!texte && !hasEmbed && !image) {
      return interaction.reply({ content: '❌ Fournis au moins un paramètre.', ephemeral: true });
    }

    let colorResolved;
    if (couleur) {
      const hex = couleur.replace('#', '');
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return interaction.reply({ content: '❌ Couleur invalide. Format : `#RRGGBB`', ephemeral: true });
      }
      colorResolved = parseInt(hex, 16);
    }

    const payload = {};
    if (texte) payload.content = texte;

    if (hasEmbed || (image && !texte)) {
      const embed = new EmbedBuilder();
      if (titre)     embed.setTitle(titre);
      if (desc)      embed.setDescription(desc);
      embed.setColor(colorResolved ?? 0x5865f2);
      if (footer)    embed.setFooter({ text: footer });
      if (image)     embed.setImage(image);
      if (thumbnail) embed.setThumbnail(thumbnail);
      if (auteur)    embed.setAuthor({ name: auteur });
      embed.setTimestamp();
      payload.embeds = [embed];
    } else if (image && texte) {
      payload.content += `\n${image}`;
    }

    await interaction.channel.send(payload);
    await interaction.reply({ content: '✅ Message envoyé !', ephemeral: true });
  },
};
