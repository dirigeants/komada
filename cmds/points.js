exports.run = (bot, msg, params = []) => {
  msg.reply(`Seems you got ${bot.functions.optn.points(bot, msg, "view")} points at the moment.`);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "points",
  description: "Extra, Extra, get your points, get your fresh points!",
  usage: "points"
};
