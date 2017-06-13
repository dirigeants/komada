module.exports = async (client, msg) => {
  if (client.config.prefixMention.test(msg.content)) return client.config.prefixMention;
  const config = await msg.guildConf;
  let { prefix } = config;
  const escape = client.funcs.regExpEsc;
  if (prefix instanceof Array) {
    prefix.forEach((pref) => {
      if (msg.content.startsWith(pref)) prefix = pref;
      else prefix = false;
    });
  }
  if (prefix && msg.content.startsWith(prefix)) return new RegExp(`^${escape(prefix)}`);
  return false;
};
