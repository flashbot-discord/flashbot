const Command = require('../../classes/Command')

class DBKRVerifyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hellothisisverification',
      desc: 'commands.hellothisisverification.DESC',
      group: 'misc'
    })
  }

  run(client, msg, _query, _locale) {
    msg.reply(client.user.tag)
  }
}
