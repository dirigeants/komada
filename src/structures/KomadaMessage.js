/* eslint-disable consistent-return */
const { Structures } = require("discord.js");

module.exports = Structures.extend("Message", (Message) => {
  class KomadaMessage extends Message {

    constructor(...args) {
      super(...args);

      /**
       * The command attempting to be ran, is currently running, or has already been ran.
       * @type {?Command}
       */
      this.command = null;

      /**
     * The prefix used to run the said command.
     * @type {?RegExp}
     */
      this.prefix = null;

      /**
     * The length of the prefix for this message.
     * @type {?number}
     */
      this.prefixLength = null;

      /**
     * An array of string arguments contained in the message, split by the usageDelim for the command.
     * @type {string[]}
     */
      this.args = null;

      /**
     * An array of resolved arguments for this command.
     * @type {any[]}
     */
      this.params = null;

      // TODO: Create a better prompting system
      /**
     * Whether or not this message was reprompted for additional arguments.
     * @type {boolean}
     */
      this.reprompted = false;
    }

    /**
   * Whether or not the ClientUser can add reactions to this message.
   * @readonly
   * @type {boolean}
   */

    get reactable() {
      return this.guild ? this.readable && this.permissionsFor(this.guild.me).has("ADD_REACTIONS") : true;
    }

    /**
   * Runs all Monitors from the bot on this message. This is called automatically and shouldn't need to be invoked again.
   * @private
   */

    runMonitors() {
      this.client.messageMonitors.forEach((monit) => {
        const { enabled, ignoreBots, ignoreSelf } = monit.conf;
        if (enabled) {
          if (ignoreBots && this.author.bot) return;
          if (ignoreSelf && this.client.user === this.author) return;
          monit.run(this.client, this);
        }
      });
    }

    /**
   * Transforms a Regular KomadaMessage into a Command KomadaMessage.
   * @private
   * @param  {Command} command The command for this message.
   * @param  {RegExp} prefix  The prefix used for this message.
   * @param  {number} length  The length of the prefix used for this message.
   */
    _registerCommand({ command, prefix, length }) {
      this.command = command;
      this.prefix = prefix;
      this.prefixLength = length;
      this.args = this.constructor.getArgs(this);
      this.params = [];
    }

    /**
   * Whether or not Komada should handle the incoming message for commands.
   * @private
   * @readonly
   * @returns {boolean}
   */
    get _handle() {
      const { ignoreBots, ignoreSelf } = this.client.config;
      if (ignoreBots && this.author.bot) return false;
      if (ignoreSelf && this.client.user === this.author) return false;
      if (!this.client.user.bot && this.author !== this.client.user) return false;
      if (this.client.user.bot && this.author === this.client.user) return false;
      return true;
    }

    /**
 * Validates and resolves args into parameters
 * @private
 * @returns {any[]} The resolved parameters
 */
    async validateArgs() {
      if (this.params.length >= this.command.usage.parsedUsage.length && this.params.length >= this.args.length) {
        return this.params;
      } else if (this.command.usage.parsedUsage[this.params.length]) {
        if (this.command.usage.parsedUsage[this.params.length].type !== "repeat") {
          this._currentUsage = this.command.usage.parsedUsage[this.params.length];
        } else if (this.command.usage.parsedUsage[this.params.length].type === "repeat") {
          this._currentUsage.type = "optional";
          this._repeat = true;
        }
      } else if (!this._repeat) {
        return this.params;
      }
      if (this._currentUsage.type === "optional" && (this.args[this.params.length] === undefined || this.args[this.params.length] === "")) {
        if (this.command.usage.parsedUsage.slice(this.params.length).some(usage => usage.type === "required")) {
          this.args.splice(this.params.length, 0, undefined);
          this.args.splice(this.params.length, 1, null);
          throw this.client.funcs.newError("Missing one or more required arguments after end of input.", 1);
        } else {
          return this.params;
        }
      } else if (this._currentUsage.type === "required" && this.args[this.params.length] === undefined) {
        this.args.splice(this.params.length, 1, null);
        throw this.client.funcs.newError(this._currentUsage.possibles.length === 1 ?
          `${this._currentUsage.possibles[0].name} is a required argument.` :
          `Missing a required option: (${this._currentUsage.possibles.map(poss => poss.name).join(", ")})`, 1);
      } else if (this._currentUsage.possibles.length === 1) {
        if (this.client.argResolver[this._currentUsage.possibles[0].type]) {
          return this.client.argResolver[this._currentUsage.possibles[0].type](this.args[this.params.length], this._currentUsage, 0, this._repeat, this)
            .catch((err) => {
              this.args.splice(this.params.length, 1, null);
              throw this.client.funcs.newError(err, 1);
            })
            .then((res) => {
              if (res !== null) {
                this.params.push(res);
                return this.validateArgs();
              }
              this.args.splice(this.params.length, 0, undefined);
              this.params.push(undefined);
              return this.validateArgs();
            });
        }
        this.client.emit("log", "Unknown Argument Type encountered", "warn");
        return this.validateArgs();
      } else {
        return this.multiPossibles(0, false);
      }
    }

    /**
 * Validates and resolves args into parameters, when multiple types of usage is defined
 * @param {number} possible The id of the possible usage currently being checked
 * @param {boolean} validated Escapes the recursive function if the previous iteration validated the arg into a parameter
 * @private
 * @returns {any[]} The resolved parameters
 */
    async multiPossibles(possible, validated) {
      if (validated) {
        return this.validateArgs();
      } else if (possible >= this._currentUsage.possibles.length) {
        if (this._currentUsage.type === "optional" && !this._repeat) {
          this.args.splice(this.params.length, 0, undefined);
          this.params.push(undefined);
          return this.validateArgs();
        }
        this.args.splice(this.params.length, 1, null);
        throw this.client.funcs.newError(`Your option didn't match any of the possibilities: (${this._currentUsage.possibles.map(poss => poss.name).join(", ")})`, 1);
      } else if (this.client.argResolver[this._currentUsage.possibles[possible].type]) {
        return this.client.argResolver[this._currentUsage.possibles[possible].type](this.args[this.params.length], this._currentUsage, possible, this._repeat, this.msg)
          .then((res) => {
            if (res !== null) {
              this.params.push(res);
              return this.multiPossibles(++possible, true);
            }
            return this.multiPossibles(++possible, validated);
          })
          .catch(() => this.multiPossibles(++possible, validated));
      } else {
        this.client.emit("log", "Unknown Argument Type encountered", "warn");
        return this.multiPossibles(++possible, validated);
      }
    }


    /**
   * Parses a message into string args
   * @param {KomadaMessage} msg this command message
   * @private
   * @returns {string[]}
   */
    static getArgs(msg) {
      const args = msg.content.slice(msg.prefixLength).trim().split(" ").slice(1)
        .join(" ")
        .split(msg.command.help.usageDelim !== "" ? msg.command.help.usageDelim : undefined);
      if (args[0] === "") return [];
      return args;
    }

    get usableCommands() {
      return this.client.commands.filter(command => !this.client.commandInhibitors.some((inhibitor) => {
        if (inhibitor.conf.enabled && !inhibitor.conf.spamProtection) return inhibitor.run(this.client, this, command);
        return false;
      }));
    }

    hasPermLevel(min) {
      return !!this.client.funcs.checkPerms(this.client, this, min);
    }

    send(content, options) {
      return this.sendMessage(content, options);
    }

    sendCode(lang, content, options = {}) {
      return this.sendMessage(content, Object.assign(options, { code: lang }));
    }

    sendEmbed(embed, content, options) {
      if (!options && typeof content === "object") {
        options = content;
        content = "";
      } else if (!options) {
        options = {};
      }
      return this.sendMessage(content, Object.assign(options, { embed }));
    }

    sendFile(attachment, name, content, options = {}) {
      return this.send({ files: [{ attachment, name }], content, options });
    }

    sendFiles(files, content, options = {}) {
      return this.send(content, Object.assign(options, { files }));
    }

    sendMessage(content, options) {
      if (!this.channel) return this.send(content, options);
      const commandMessage = this.client.commandMessages.get(this.id);
      if (commandMessage && (!options || !("files" in options))) return commandMessage.response.edit(content, options);
      return this.channel.send(content, options)
        .then((mes) => {
          if (mes instanceof KomadaMessage && (!options || !("files" in options))) this.client.commandMessages.set(this.id, { trigger: this, response: mes });
          return mes;
        });
    }

  }
  return KomadaMessage;
});
