const Command = require('../_Command')

class MaintenanceCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'maintenance',
      aliases: ['maintain', '점검', 'ㅡ먀ㅜㅅ두뭋ㄷ', 'ㅡ먀ㅜㅅ먀ㅜ', 'wjarja'],
      group: 'dev',
      owner: true,
      args: [
        {
          key: 'status',
          type: 'string',
          optional: false
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    const cmd = query.args.status

    if (['start', 'on', '시작', 'ㄴㅅㅁㄱㅅ', 'ㅐㅜ', 'tlwkr'].includes(cmd)) {
      // Start maintenance
      client.onlineMode = false
      msg.reply(t('commands.maintenance.start'))
    } else if (['end', 'off', '종료', '둥', 'ㅐㄹㄹ', 'whdfy'].includes(cmd)) {
      // End maintenance
      client.onlineMode = true
      msg.reply(t('commands.maintenance.end'))
    } else {
      msg.reply(t('commands.maintenance.status', `${String(!client.onlineMode)})\n` +
          t('commands.maintenance.usage', query.prefix)))
    }
  }
}

module.exports = MaintenanceCommand
