const fetch = require('node-fetch');
const { getStreamers, setStreamerLive, getConfig } = require('./db');

const POLL_INTERVAL = 60_000;
let twitchToken = null;
let tokenExpiry = 0;

async function getTwitchToken() {
  if (twitchToken && Date.now() < tokenExpiry) return twitchToken;
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });
  const data = await res.json();
  twitchToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return twitchToken;
}

async function checkStreams(client) {
  const streamers = getStreamers();
  const logins = Object.keys(streamers);
  if (logins.length === 0) return;

  let token;
  try { token = await getTwitchToken(); }
  catch (e) { console.error('[Twitch] Impossible d\'obtenir le token:', e.message); return; }

  const params = logins.map(l => `user_login=${l}`).join('&');
  const res = await fetch(`https://api.twitch.tv/helix/streams?${params}`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
    },
  });

  const { data: liveStreams } = await res.json();
  const liveNow = new Set((liveStreams || []).map(s => s.user_login.toLowerCase()));

  for (const [login, info] of Object.entries(streamers)) {
    const isLiveNow = liveNow.has(login);
    if (isLiveNow && !info.isLive) {
      const streamData = liveStreams.find(s => s.user_login.toLowerCase() === login);
      await sendLiveNotification(client, login, streamData, info.guildId);
      setStreamerLive(login, true);
    }
    if (!isLiveNow && info.isLive) {
      setStreamerLive(login, false, null);
    }
  }
}

async function sendLiveNotification(client, login, streamData, guildId) {
  const config = getConfig(guildId);
  if (!config.notifChannelId) return;
  const channel = await client.channels.fetch(config.notifChannelId).catch(() => null);
  if (!channel) return;
  await channel.send(`Bonjour @everyone ! notre incroyable <@&1508428118581575791>, **${login}** à lancé un Live Steam sur Twitch clique ici pour aller sur le [Stream](https://twitch.tv/${login})`).catch(console.error);
}

function startTwitchPoller(client) {
  console.log('[Twitch] Démarrage du système de notifications...');
  checkStreams(client);
  setInterval(() => checkStreams(client), POLL_INTERVAL);
}

module.exports = { startTwitchPoller };
