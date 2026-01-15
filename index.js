import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ====== INSTELLINGEN ======
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 uur
// ==========================

async function getWarningsText() {
  const url = "https://www.knmi.nl/waarschuwingen";
  const res = await fetch(url);
  const html = await res.text();

  if (html.includes("Geen waarschuwingen actief")) {
    return `# KNMI waarschuwingen

Geen waarschuwingen actief.

Meer informatie: https://www.knmi.nl/waarschuwingen`;
  }

  return `# KNMI waarschuwingen

Er is een waarschuwing actief.  
Bekijk details op de KNMI-website.

Meer informatie: https://www.knmi.nl/waarschuwingen`;
}

async function postUpdate() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) return;

  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessages = messages.filter(m => m.author.id === client.user.id);
  for (const msg of botMessages.values()) {
    await msg.delete();
  }

  const text = await getWarningsText();
  const sent = await channel.send(text);
  await sent.pin();
}

client.once("clientReady", async () => {
  console.log("Bot gestart");

  await postUpdate();
  setInterval(postUpdate, UPDATE_INTERVAL);
});

client.login(DISCORD_TOKEN);
