const Command = require('../../classes/Command')

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

  async run (client, msg, _query, locale) {
    if (client.db.type !== 'json') return await msg.reply(client.locale.t('commands.savenow.DBNotJSON:This only works with the JSON database.', locale))

    client.db.save()
    return await msg.reply(client.locale.t('commands.savenow.saved:All JSON data were saved.', locale))
  }
}

module.exports = SaveNowCommand
