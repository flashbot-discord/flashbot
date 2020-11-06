/**
 * @name beep.js
 * @description beep - boop
 */

const Command = require('../../structures/Command')

class BeepCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'beep',
      description: 'commands.beep.DESC:boop',
      group: 'misc'
    })
  }

  async run (client, msg, _args, locale) {
    return await msg.channel.send(client.locale.t('commands.beep.run:boop', locale))
  }
}

module.exports = BeepCommand
