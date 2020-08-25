const fs = require('fs')
const path = require('path')
const { Collection, MessageCollector } = require('discord.js')
const hangul = require('hangul-js')

const Command = require('../../classes/Command')

class TypingGameCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'typing',
      aliases: ['타자'],
      description: 'commands.typing.DESC',
      group: 'game',
      guildAct: true
    })

    this.loaded = false
    this.loading = false
    this.default = 'ko_KR'
    this.session = new Collection()
    this.data = new Collection()
    this.path = path.join(path.resolve(), 'modules', 'typing')
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t

    switch (query.args[0]) {
      case 'reload':
      case '리로드':
        if (!client.config.owner.includes(msg.author.id)) return msg.reply(t('commands.typing.noPermissionToReload', locale))

        this.loaded = false
        this.data.forEach((_, lang) => {
          delete require.cache[path.join(this.path, lang + '.json')]
        })

        return this.loadData(msg, locale)

      case 'start':
      case '시작': {
        if (!this.loaded) {
          msg.channel.send(t('commands.typing.loading', locale))
          if (this.loading) return
          this.loadData(msg, locale)
        }

        // Stop when session is present
        if (this.session.has(msg.channel.id)) return msg.channel.send(t('commands.typing.alreadyPlaying', locale))

        // Session placeholder
        this.session.set(msg.channel.id, {})

        // Choose Language
        let lang = this.default
        if (query.args[1]) {
          if (['영어', 'english'].includes(query.args[1])) lang = 'en_US'
        }

        if (!this.data.get(this.default)) {
          msg.channel.send(t('commands.typing.noDefaultData'))
          return this.stop(msg, locale)
        }
        const langData = this.data.get(lang)
        if (!langData) {
          msg.channel.send(t('commands.typing.langDataNotExist', locale))
          return this.stop(msg, locale)
        }

        const text = langData[Math.floor(Math.random() * langData.length)]
        const displayText = text.split('').join('\u200b')

        await msg.channel.send(t('commands.typing.start', locale, displayText))

        // Timer start
        const startTime = Date.now()

        const mc = msg.channel.createMessageCollector((m) => !m.author.bot, { time: 60000 })

        // push the collector to the session storage
        this.session.set(msg.channel.id, mc)

        mc.on('collect', (m) => {
          if (m.content === displayText) return msg.channel.send('<@' + m.author.id + '>, ' + t('commands.typing.doNotCopyPaste', locale))

          if (m.content !== text) return // msg.channel.send('<@' + m.author.id + '>, ' + t('commands.typing.notMatch', locale))

          const time = (Date.now() - startTime) / 1000
          const ta = Math.round(hangul.d(text).length / time * 60)
          msg.channel.send('<@' + m.author.id + '>, ' + t('commands.typing.correct', locale, time, ta))
          mc.stop('correct')
        })

        mc.on('end', (_, reason) => {
          // if (reason === 'correct') return
          if (reason === 'stopcmd') msg.channel.send(t('commands.typing.cmdStop', locale))
          else if (reason !== 'correct') msg.channel.send(t('commands.typing.finish', locale))

          // remove channel from session storage
          this.session.delete(msg.channel.id)
        })

        break
      }

      case 'stop':
      case '종료':
      case '정지':
      case '중지':
        this.stop(msg, locale)
    }
  }

  stop (msg, locale) {
    if (!this.session.has(msg.channel.id)) return msg.channel.send(msg.client.locale.t('commands.typing.notPlaying', locale))

    if (this.session.get(msg.channel.id) instanceof MessageCollector) this.session.get(msg.channel.id).stop('stopcmd')
    this.session.delete(msg.channel.id)
  }

  loadData (msg, locale) {
    // TODO make it async
    const t = msg.client.locale.t

    if (!fs.existsSync(this.path)) return msg.channel.send(t('commands.typing.noDataFolder', locale))

    const locales = fs.readdirSync(this.path)
    if (locales.length < 1) return msg.channel.send(t('commands.typing.noDataFile', locale))

    locales.forEach((l) => {
      if (!fs.lstatSync(path.join(this.path, l)).isFile() || !l.endsWith('.json')) return
      this.data.set(l.slice(0, -5), require(path.join(this.path, l)))
    })

    this.loaded = true
    this.loading = false
    msg.channel.send(t('commands.typing.loaded', locale))
  }
}

module.exports = TypingGameCommand
