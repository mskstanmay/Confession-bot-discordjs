//Requiere all packages necessary
const { Client, MessageEmbed } = require("discord.js");
const db = require("quick.db");
const ms = require("ms");

// Importing Config.json properties
const {
  token,
  confessionchannelid,
  logchannelid,
  confessioncooldown,
} = require("./config.json");

//CLient declare 7 Logging in !
const client = new Client({ disableEveryone: true });
client.login(token);

client.once("ready", () => {
  //Setting the bot's Activity & console logging ready !
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("Dm me Your Confessions", { type: "WATCHING" });
});

client.on("message", async (message) => {
  //Returning if msg isn't a dm && Bot's Msg !
  if (message.channel.type != "dm") return;
  if (message.author.id == "855293494792159262") return;

  //Fetching User From Db if they exist...
  const usercooldown = await db.fetch(message.author.id);

  //If they exist and their time has not yet been over [ Return statement at end so else isn't needed :) ]
  if (usercooldown && confessioncooldown - (Date.now() - usercooldown) > 0) {
    return message.reply({
      embed: {
        color: "#ff0000",
        description: `:stopwatch: Nu ! | You Can Confess Again in ${ms(
          confessioncooldown - (Date.now() - usercooldown)
        )}`,
      },
    });
  }

  //Setting Cooldown after people submit A Confession.
  db.set(message.author.id, Date.now());

  //Declaring Our Embeds
  const confessionembed = new MessageEmbed()
    .setColor("#F1C40F")
    .setDescription(`"${message.content}"`)
    .setAuthor(`Anonymous Confession Arrived | Dm me to confess 👀`)
    .setTimestamp();

  const logembed = new MessageEmbed()
    .setFooter(
      message.author.tag + " | " + message.author.id + " |",
      message.author.displayAvatarURL()
    )
    .setTitle(`Confession Arrived`)

    .setDescription(`**Confessor :** ${message.author}\n\n${message.content}`)
    .setThumbnail(message.author.displayAvatarURL({ size: 512, dynamic: true }))
    .setTimestamp();

  //Sending Our emebeds in their respective channels .
  client.channels.cache.get(confessionchannelid).send(confessionembed);
  client.channels.cache.get(logchannelid).send(logembed);
  message.reply(
    `**Thanks for confessing honestly. I will keep this as a secret between u and me :zipper_mouth: .**`
  );
});
