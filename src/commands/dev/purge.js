const Command = require('../_Command')

class PurgeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'purge',
      aliases: ['ㅔㅕㄱㅎㄷ'],
      group: 'dev',
      owner: true,
      args: [
        {
          key: 'name',
          type: 'string'
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    if (query.args < 1) return await msg.reply(Command.makeUsage(this, query.cmd, t))

    // TODO WIP
  }
}

module.exports = PurgeCommand
