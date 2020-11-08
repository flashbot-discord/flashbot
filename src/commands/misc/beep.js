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

  async run (client, msg, _args, { t }) {
    return msg.channel.send(t('commands.beep.run:boop'))
  }
}

module.exports = BeepCommand
