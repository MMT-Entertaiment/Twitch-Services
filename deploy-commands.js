require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];
const files = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of files) {
  const cmd = require(`./commands/${file}`);
  if (cmd.data) commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Déploiement de ${commands.length} commande(s)...`);
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);
    await rest.put(route, { body: commands });
    const scope = process.env.GUILD_ID ? 'sur le serveur de test (instantané)' : 'globalement (jusqu\'à 1h)';
    console.log(`✅ ${commands.length} commande(s) déployée(s) ${scope}`);
  } catch (e) {
    console.error(e);
  }
})();
