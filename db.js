const fs = require('fs');
const path = require('path');

const STREAMERS_FILE = path.join(__dirname, 'data', 'streamers.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'config.json');

function readJSON(file) {
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function getStreamers() {
  return readJSON(STREAMERS_FILE);
}

function addStreamer(login, guildId, addedBy) {
  const data = getStreamers();
  data[login.toLowerCase()] = { guildId, addedBy, isLive: false, liveMessageId: null };
  writeJSON(STREAMERS_FILE, data);
}

function removeStreamer(login) {
  const data = getStreamers();
  delete data[login.toLowerCase()];
  writeJSON(STREAMERS_FILE, data);
}

function setStreamerLive(login, isLive, liveMessageId = null) {
  const data = getStreamers();
  if (!data[login.toLowerCase()]) return;
  data[login.toLowerCase()].isLive = isLive;
  data[login.toLowerCase()].liveMessageId = liveMessageId;
  writeJSON(STREAMERS_FILE, data);
}

function getConfig(guildId) {
  const data = readJSON(CONFIG_FILE);
  return data[guildId] || {};
}

function setConfig(guildId, config) {
  const data = readJSON(CONFIG_FILE);
  data[guildId] = { ...(data[guildId] || {}), ...config };
  writeJSON(CONFIG_FILE, data);
}

module.exports = { getStreamers, addStreamer, removeStreamer, setStreamerLive, getConfig, setConfig };
