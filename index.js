require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const REEL_REGEX = /https?:\/\/(www\.)?facebook\.com\/(reels?|[^/\s]+\/videos)\/[^\s]+/g;

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.id === client.user.id) return;

  const matches = message.content.match(REEL_REGEX);
  if (!matches) return;

  const fixedUrls = matches.map((url) =>
    url.replace("facebook.com", "fixacebook.com")
  );

  const [reply] = await Promise.allSettled([
    message.reply(fixedUrls.join("\n")),
    message.suppressEmbeds(true).catch((err) => {
      console.error("Failed to suppress embeds:", err.message);
    }),
  ]);

  if (reply.status === "rejected") {
    console.error("Failed to send reply:", reply.reason);
  }
});

client.login(process.env.DISCORD_TOKEN);
