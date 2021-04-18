const fetch = require('node-fetch')

const Command = require('../_Command')

const APP = {
  youtube: {
    name: 'Youtube Together',
    id: '755600276941176913'
  },
  betrayal: {
    name: 'Betrayal.io',
    id: '773336526917861400'
  },
  fishington: {
    name: 'Fishington.io',
    id: '814288819477020702'
  }
}

class VoiceActivityCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'vcactivity',
      aliases: ['vcact', '음챗액티비티', 'ㅍㅊㅁㅊㅅ', 'ㅍㅊㅁㅊ샤퍄쇼', 'dmacotdorxlqlxl'],
      group: 'util',
      args: [
        {
          key: 'activity',
          type: 'string'
        },
        {
          key: 'channel',
          type: 'channel',
          optional: true
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    const vc = query.args.channel || msg.member.voice.channel
    if (!vc && !msg.member.voice.channel) return msg.reply(t('commands.vcactivity.needToJoinVC'))

    if (!vc.permissionsFor(client.user).has('CREATE_INSTANT_INVITE')) return msg.reply(t('commands.vcactivity.noPerms'))

    const app = APP[query.args.activity]
    if (!app) return

    // NOTE: raw request; can be broken on api breaking changes
    client.api
      .channels(vc.id)
      .invites.post({
        data: {
          temporary: false,
          max_age: 3600, // 1 hour
          max_uses: 0,
          unique: false,

          target_type: 2,
          target_application_id: app.id
        }
      })
      .then(res => {
        const link = 'https://discord.gg/' + res.code
        msg.channel.send(t('commands.vcactivity.done', {
          appName: app.name,
          link
        }))
      })
  }
}

module.exports = VoiceActivityCommand
