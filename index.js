require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { startTwitchPoller } = require('./twitch');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  if (cmd.data && cmd.execute) {
    client.commands.set(cmd.data.name, cmd);
    console.log(`✅ Commande chargée : /${cmd.data.name}`);
  }
}

client.once('ready', () => {
  console.log(`\n🤖 Connecté en tant que ${client.user.tag}`);
  startTwitchPoller(client);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(`Erreur /${interaction.commandName}:`, err);
    const msg = { content: '❌ Une erreur est survenue.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
    else await interaction.reply(msg);
  }
});

client.login(process.env.DISCORD_TOKEN);
