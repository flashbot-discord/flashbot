const Command = require('../_Command')

class SaveNowCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'savenow',
      description: 'commands.savenow.DESC:Saves the json database file now.',
      aliases: ['ㄴㅁㅍ두ㅐㅈ'],
      group: 'dev',
      owner: true
    })
  }

  async run (client, msg, _query, { t }) {
    if (client.db.type !== 'json') return await msg.reply(t('commands.savenow.DBNotJSON'))

    client.db.save()
    return await msg.reply(t('commands.savenow.saved'))
  }
}

module.exports = SaveNowCommand
