exports.run = async (client, msg, [type, name]) => {
  switch (type) {
    case "function":
      if (name === "all") {
        await client.funcs._loadFunctions();
        await Promise.all(Object.keys(client.funcs).map((key) => {
          if (client.funcs[key].init) return client.funcs[key].init(client);
          return true;
        }));
        return msg.sendMessage("✅ Reloaded all functions.");
      }
      await msg.sendMessage(`Attempting to reload function ${name}`);
      return client.funcs._reloadFunction(name)
        .then(mes => msg.sendMessage(`✅ ${mes}`))
        .catch(err => msg.sendMessage(`❌ ${err}`));

    case "inhibitor":
      if (name === "all") {
        await client.funcs._loadInhibitors();
        await Promise.all(client.commandInhibitors.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        return msg.sendMessage("✅ Reloaded all inhibitors.");
      }
      await msg.sendMessage(`Attempting to reload inhibitor ${name}`);
      return client.funcs._reloadInhibitor(name)
        .then(mes => msg.sendMessage(`✅ ${mes}`))
        .catch(err => msg.sendMessage(`❌ ${err}`));

    case "finalizer":
      if (name === "all") {
        await client.funcs._loadFinalizers();
        await Promise.all(client.commandFinalizers.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        return msg.sendMessage("✅ Reloaded all finalizers.");
      }
      await msg.sendMessage(`Attempting to reload finalizer ${name}`);
      return client.funcs._reloadFinalizer(name)
        .then(mes => msg.sendMessage(`✅ ${mes}`))
        .catch(err => msg.sendMessage(`❌ ${err}`));

    case "event":
      if (name === "all") {
        await client.funcs._loadEvents();
        return msg.sendMessage("✅ Reloaded all events.");
      }
      await msg.sendMessage(`Attempting to reload event: ${name}`);
      return client.funcs._reloadEvent(name)
        .then(mes => msg.sendMessage(`✅ ${mes}`))
        .catch(err => msg.sendMessage(`❌ ${err}`));

    case "monitor":
      if (name === "all") {
        await client.funcs._loadMonitors();
        await Promise.all(client.messageMonitors.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        return msg.sendMessage("✅ Reloaded all monitors.");
      }
      await msg.sendMessage(`Attempting to reload monitor: ${name}`);
      return client.funcs._reloadMonitor(name)
        .then(mes => msg.sendMessage(`✅ ${mes}`))
        .catch(err => msg.sendMessage(`❌ ${err}`));

    case "provider":
      if (name === "all") {
        await client.funcs._loadProviders();
        await Promise.all(client.providers.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        return msg.sendMessage("✅ Reloaded all providers.");
      }
      await msg.sendMessage(`Attempting to reload provider: ${name}`);
      return client.funcs._reloadProvider(name)
        .then(mes => msg.sendMessage(`✅ ${mes}`))
        .catch(err => msg.sendMessage(`❌ ${err}`));

    case "command":
      if (name === "all") {
        await client.funcs._loadCommands();
        await Promise.all(client.commands.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        return msg.sendMessage("✅ Reloaded all commands.");
      }
      await msg.sendMessage(`Attempting to reload command ${name}`);
      return client.funcs._reloadCommand(name)
        .then(mes => msg.sendMessage(`✅ ${mes}`))
        .catch(err => msg.sendMessage(`❌ ${err}`));

    default:
      return msg.sendMessage("never going to happen");
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["r", "load"],
  permLevel: 10,
  botPerms: ["SEND_MESSAGES"],
  requiredFuncs: [],
  requiredSettings: [],
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "<function|inhibitor|finalizer|monitor|provider|event|command> <name:str>",
  usageDelim: " ",
};
