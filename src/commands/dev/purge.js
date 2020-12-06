const Command = require('../_Command')

class PurgeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'purge',
      description: 'commands.purge.DESC:Purges database cache.',
      aliases: ['ㅔㅕㄱㅎㄷ'],
      group: 'dev',
      owner: true,
      args: [
        {
          key: 'name',
          description: 'commands.purge.args.name.DESC:The name of the data to purge cache. (guild / user)',
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
