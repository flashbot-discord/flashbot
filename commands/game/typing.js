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
      group: 'game'
    })

    this.loaded = false
    this.loading = false
    this.default = 'ko_KR'
    this.session = new Collection()
    this.data = new Collection()
    this.locales = new Collection()
    this.path = path.join(path.resolve(), 'data', 'typing')
    this._logPos = 'Command / typing'
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
          const l = this.locales.get(query.args[1])
          if (this.data.has(l)) lang = l
        }

        const langData = this.data.get(lang)
        if (!langData) {
          msg.channel.send(t('commands.typing.langDataNotExist', locale))
          return this.stop(msg, locale)
        }

        // TODO category select
        const category = langData.random()
        const data = category.data[Math.floor(Math.random() * category.data.length)]

        const { text } = data
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
    this.loading = true
    const logPos = this._logPos + '.loadData'

    msg.client.logger.log(logPos, 'Start loading typing data...')

    if (!fs.existsSync(this.path)) return msg.channel.send(t('commands.typing.noDataFolder', locale))

    const locales = fs.readdirSync(this.path)
    if (locales.length < 1) return msg.channel.send(t('commands.typing.noLocaleFolder', locale))

    locales.forEach((l) => {
      msg.client.logger.log(logPos, `Loading typing data for locale '${l}'...`)
      msg.client.logger.debug(logPos, 'load path: ' + path.join(this.path, l))
      if (
        !(fs.lstatSync(path.join(this.path, l)).isDirectory()) ||
        !fs.existsSync(path.join(this.path, l, 'manifest.json')) ||
        !(fs.lstatSync(path.join(this.path, l, 'manifest.json')).isFile())
      ) return
      
      const manifest = JSON.parse(fs.readFileSync(path.join(this.path, l, 'manifest.json')).toString())
      const data = new Collection()
      const tempDataSortedByGroup = {}

      manifest.groups.forEach((group) => {
        msg.client.logger.debug(logPos, `register group '${group.id}'`)
        data.set(group.id, group)
        tempDataSortedByGroup[group.id] = []
      })
      manifest.locale.forEach((ll) => {
        msg.client.logger.debug(logPos, `register locale alias '${ll}'`)
        this.locales.set(ll, l)
      })

      manifest.files.forEach((file) => {
        msg.client.logger.debug(logPos, `load data file '${file}'`)
        const textData = JSON.parse(fs.readFileSync(path.join(this.path, l, file)).toString())
        textData.forEach((td) => {
          tempDataSortedByGroup[td.group].push(td)
        })
      })

      manifest.groups.forEach((group) => {
        msg.client.logger.debug(logPos, `applying data file to group '${group.id}'`)
        const tempData = data.get(group.id)
        tempData.data = tempDataSortedByGroup[group.id]
        data.set(group.id, tempData)
      })

      this.data.set(l, data)
    })

    this.loaded = true
    this.loading = false
    msg.channel.send(t('commands.typing.loaded', locale))
  }
}

module.exports = TypingGameCommand
