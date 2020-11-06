const Command = require('../../structures/Command')

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
          name: 'commands.purge.args.name.NAME:name',
          description: 'commands.purge.args.name.DESC:The name of the data to purge cache. (guild / user)',
          type: 'common.string:string'
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    if (query.args < 1) return await msg.reply(Command.makeUsage(this, query.cmd, locale))

    // TODO WIP
  }
}

module.exports = PurgeCommand
