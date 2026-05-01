require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PLATFORMS = [
  {
    regex: /https?:\/\/(www\.)?facebook\.com\/(reels?|[^/\s]+\/videos)\/[^\s]+/g,
    find: "facebook.com",
    replace: "fixacebook.com",
  },
  {
    regex: /https?:\/\/(www\.)?instagram\.com\/reel\/[^\s]+/g,
    find: "instagram.com",
    replace: "vxinstagram.com",
    stripQuery: true,
  },
  {
    regex: /https?:\/\/(www\.)?tiktok\.com\/(t\/[^\s]+|@[^/\s]+\/video\/[^\s]+)/g,
    find: "tiktok.com",
    replace: "tnktok.com",
    stripQuery: true,
  },
];

client.once("clientReady", () => {
  console.log(`[${new Date().toISOString()}] Logged in as ${client.user.tag}`);
  setInterval(() => {
    console.log(`[${new Date().toISOString()}] Heartbeat - bot is alive, ping: ${client.ws.ping}ms`);
  }, 60_000);
});

client.on("messageCreate", async (message) => {
  if (message.author.id === client.user.id) return;

  const fixedUrls = [];
  for (const platform of PLATFORMS) {
    const matches = message.content.match(platform.regex);
    if (matches) {
      matches.forEach((url) => {
        let fixed = url.replace(platform.find, platform.replace);
        if (platform.stripQuery) fixed = fixed.split("?")[0];
        fixedUrls.push(fixed);
      });
    }
  }

  if (!fixedUrls.length) return;

  console.log(`[${new Date().toISOString()}] Fixing ${fixedUrls.length} URL(s) in #${message.channel.name} from ${message.author.tag}`);
  fixedUrls.forEach((url) => console.log(`  → ${url}`));

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
