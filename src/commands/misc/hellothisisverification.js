const Command = require('../../structures/Command')

class DBKRVerifyCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hellothisisverification',
      description: 'commands.hellothisisverification.DESC',
      group: 'misc'
    })
  }

  run (client, msg, _query, _) {
    msg.reply('comjun04#5963 (393674169243402240)')
  }
}

module.exports = DBKRVerifyCommand
