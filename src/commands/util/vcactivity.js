const Command = require('../_Command')
const isSnowflake = require('../../structures/types').snowflake.validate

const ALIASES = {
  youtube: 'youtube',
  yt: 'youtube',
  유튜브: 'youtube',

  'youtube-dev': 'youtube_dev',
  youtube_dev: 'youtube_dev',
  ytdev: 'youtube_dev',
  유튜브개발: 'youtube_dev',

  'youtube-legacy': 'ytlegacy',
  youtube_legacy: 'ytlegacy',
  ytlegacy: 'ytlegacy',
  구유튜브: 'ytlegacy',

  betrayal: 'betrayal',

  fishington: 'fishington',
  fish: 'fishington',
  낚시: 'fishington',

  pokernight: 'pokernight',
  poker: 'pokernight',
  포커: 'pokernight',

  chess: 'chess',
  체스: 'chess',

  doodlecrew: 'doodlecrew',
  doodle: 'doodlecrew',
  그림그리기: 'doodlecrew',

  wordsnacks: 'wordsnacks',

  lettertile: 'lettertile'
}

const APP = {
  youtube: {
    name: 'Youtube Together',
    id: '880218394199220334'
  },
  youtube_dev: {
    name: 'Youtube Together (dev)',
    id: '880218832743055411'
  },
  ytlegacy: {
    name: 'Youtube Together (legacy)',
    id: '755600276941176913'
  },
  betrayal: {
    name: 'Betrayal.io',
    id: '773336526917861400'
  },
  fishington: {
    name: 'Fishington.io',
    id: '814288819477020702'
  },
  pokernight: {
    name: 'Poker Night',
    id: '755827207812677713'
  },
  chess: {
    name: 'Chess In The Park',
    id: '832012774040141894'
  },
  doodlecrew: {
    name: 'Doodle Crew',
    id: '878067389634314250'
  },
  wordsnacks: {
    name: 'Word Snacks',
    id: '879863976006127627'
  },
  lettertile: {
    name: 'Letter Tile',
    id: '879863686565621790'
  }
}

class VoiceActivityCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'vcactivity',
      aliases: ['vcact', '음챗액티비티', '음성챗액티비티', '음성채팅액티비티', 'ㅍㅊㅁㅊㅅ', 'ㅍㅊㅁㅊ샤퍄쇼', 'dmacotdorxlqlxl', 'dmatjdcotdlrxlqlxl', 'dmatjdcoxlddorxlqlxl'],
      group: 'util',
      args: {
        time: {
          aliases: ['t'],
          type: 'number',
          optional: true
        },
        _: [
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
      }
    })
  }

  async run (client, msg, query, { t }) {
    const vc = query.args.channel || msg.member.voice.channel
    if (!vc && !msg.member.voice.channel) return msg.reply(t('commands.vcactivity.needToJoinVC'))

    if (!vc.permissionsFor(client.user).has('CREATE_INSTANT_INVITE')) return msg.reply(t('commands.vcactivity.noPerms'))

    let app
    const activity = query.args.activity
    if (isSnowflake.test(activity)) {
      // NOTE: only bot owner can create link with any id
      if (!client.config.owner.includes(msg.author.id)) return
      app = { name: activity, id: activity }
    } else {
      app = APP[ALIASES[query.args.activity]]
      if (!app) return
    }

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
