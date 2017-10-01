exports.conf = {
  type: "get",
  method: "settings",
  appliesTo: ["Guild"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return new Proxy(this.client.settings.guilds.get(this.id), exports.handler(this.client, this));
};

/* eslint-disable consistent-return */
exports.handler = (client, guild) => ({
  get: (s, p) => {
    const key = client.settings.guilds.schema[p];
    if (!key) return undefined;
    switch (key.type) {
      case "User":
        return key.array ? s[p].map(d => client.users.get(d)) : client.users.get(s[p]);
      case "Channel":
        return key.array ? s[p].map(d => client.channels.get(d)) : client.channels.get(s[p]);
      case "TextChannel":
      case "VoiceChannel":
        return key.array ? s[p].map(d => guild.channels.get(d)) : guild.channels.get(s[p]);
      case "Role":
        return key.array ? s[p].map(d => guild.roles.get(d)) : guild.roles.get(s[p]);
      case "Guild":
        return key.array ? s[p].map(d => client.guilds.get(d)) : client.guilds.get(s[p]);
      case "Command":
        return key.array ? s[p].map(d => client.commands.get(d)) : client.commands.get(s[p]);
      default:
        return s[p];
    }
  },
  set: (s, p, v) => {
    const key = client.settings.guilds.schema[p];
    if (!key) return false;
    switch (key.array) {
      case true:
        if (s[p].includes(v)) {
          client.settings.guilds.updateArray(guild, "remove", p, v);
          return true;
        }
        client.settings.guilds.updateArray(guild, "add", p, v);
        return true;
      case false:
        client.settings.guilds.update(guild, { [p]: [v] });
        return true;
        // no default
    }
    return false;
  },
});
