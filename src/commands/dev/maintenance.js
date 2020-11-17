const Command = require('../_Command')

class MaintenanceCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'maintenance',
      aliases: ['maintain', '점검', 'ㅡ먀ㅜㅅ두뭋ㄷ', 'ㅡ먀ㅜㅅ먀ㅜ', 'wjarja'],
      description: 'commands.maintenance.DESC',
      group: 'dev',
      owner: true
    })
  }

  async run (client, msg, query, { t }) {
    const cmd = query.args[0]

    if (['start', 'on', '시작'].includes(cmd)) {
      // Start maintenance
      client.onlineMode = false
      msg.reply(t('commands.maintenance.start'))
    } else if (['end', 'off', '종료'].includes(cmd)) {
      // End maintenance
      client.onlineMode = true
      msg.reply(t('commands.maintenance.end'))
    } else {
      msg.reply(t('commands.maintenance.status', String(!client.onlineMode)) + '\n' +
      t('commands.maintenance.usage', query.prefix))
    }
  }
}

module.exports = MaintenanceCommand
