module.exports = (client, command) => `${client.config.prefix}${command.conf.aliases.length === 0 ? command.help.name : `(${command.help.name}|${command.conf.aliases.join("|")})`}${command.help.usage !== "" ? ` ${command.help.usage.split(" ").join(command.help.usageDelim)}` : ""}`;