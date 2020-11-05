const path = require('path')
const { MessageCollector } = require('discord.js')
const hangul = require('hangul-js')

const Command = require('../../classes/Command')
const typingModule = require('../../modules/typing')

// TODO change name to 'fasttype'

class TypingGameCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'typing',
      aliases: [
        'speedtype', 'fasttype', '타자', '타자게임',
        '쇼ㅔㅑㅜㅎ', '넫ㄷㅇ쇼ㅔㄷ', 'ㄹㅁㄴㅅ쇼ㅔㄷ', 'xkwk', 'xkwkrpdla'
      ],
      description: 'commands.typing.DESC',
      group: 'game'
    })

    this.default = 'ko_KR'
    this.path = path.join(path.resolve(), 'data', 'typing')
    this._logPos = 'Command / typing'
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t

    switch (query.args[0]) {
      case 'reload':
      case '리로드':
      case 'ㄱ디ㅐㅁㅇ':
      case 'flfhem':
        if (!client.config.owner.includes(msg.author.id)) return msg.reply(t('commands.typing.error.noPermissionToReload', locale))

        return this.loadData(msg, locale)

      case 'start':
      case '시작':
      case 'ㄴㅅㅁㄱㅅ':
      case 'tlwkr': {
        // Check if the data is loaded
        if (!typingModule.isLoaded()) {
          msg.channel.send(t('commands.typing.loading', locale))
          if (typingModule.isLoading()) return
          this.loadData(msg, locale)
        }

        // Stop when session is present
        if (typingModule.isPlaying(msg.channel.id)) return msg.channel.send(t('commands.typing.alreadyPlaying', locale))

        // Choose Language
        let lang = this.default
        if (query.args[1]) {
          if (typingModule.isLocaleExist(query.args[1])) lang = typingModule.getBaseLocale(query.args[1])
          else return msg.reply(t('commands.typing.error.langNotExist', locale))
        }

        // Category select
        let category
        if (query.args[2]) {
          const categoryInput = query.args[2]
          if (!typingModule.isCategoryExist(lang, categoryInput)) return msg.reply(t('commands.typing.error.categoryNotExist', locale))
          else category = categoryInput
        } else category = null

        // Check data
        const data = typingModule.getData(lang, category)
        if (data == null) return msg.reply(t('commands.typing.error.noDataInCategory', locale))

        const categoryData = data.category
        const copyright = data.from ? data.from : (categoryData.fromDefault ? categoryData.fromDefault : t('commands.typing.noCopyright', locale))

        const { text } = data
        const displayText = text.split('').join('\u200b')

        // Make collector and register first to prevent multiple run
        const mc = msg.channel.createMessageCollector((m) => !m.author.bot, { time: 60000 })
        typingModule.startGame(msg.channel.id, mc)

        await msg.channel.send(t('commands.typing.start', locale, displayText, categoryData.name, categoryData.id, copyright))

        // Timer start
        const startTime = Date.now()

        mc.on('collect', (m) => {
          if (m.content === displayText) return msg.channel.send('<@' + m.author.id + '>, ' + t('commands.typing.doNotCopyPaste', locale))

          if (m.content !== text) return // msg.channel.send('<@' + m.author.id + '>, ' + t('commands.typing.notMatch', locale))

          const time = (Date.now() - startTime) / 1000
          const ta = Math.round(hangul.d(text).length / time * 60)
          msg.channel.send('<@' + m.author.id + '>, ' + t('commands.typing.correct', locale, time, ta))
          mc.stop('correct')
        })

        mc.on('end', (_, reason) => {
          if (reason === 'stopcmd') msg.channel.send(t('commands.typing.cmdStop', locale))
          else if (reason !== 'correct') msg.channel.send(t('commands.typing.finish', locale))

          // remove channel from session storage
          typingModule.endGame(msg.channel.id)
        })

        break
      }

      case 'stop':
      case '종료':
      case '정지':
      case '중지':
      case 'ㄴ새ㅔ':
      case 'whdfy':
      case 'wjdwl':
      case 'wndwl':
        this.stop(msg, locale)
        break

      case '카테고리':
      case 'category':
      case 'zkxprhfl':
      case 'ㅊㅁㅅㄷ해교':
        if (!query.args[1]) return msg.reply(t('commands.typing.emptyCategorySearchQuery', locale, query.prefix))
        else return msg.reply('WIP')
    }
  }

  stop (msg, locale) {
    if (!typingModule.isPlaying(msg.channel.id)) return msg.channel.send(msg.client.locale.t('commands.typing.notPlaying', locale))

    const session = typingModule.getSession(msg.channel.id)
    if (session instanceof MessageCollector) {
      session.stop('stopcmd')
      typingModule.endGame(msg.channel.id)
    }
  }

  loadData (msg, locale) {
    const t = msg.client.locale.t
    const result = typingModule.loadData(this.path, msg.client.logger)

    if (!result.success) {
      // TODO Only report this to console and support server error log channel
      switch (result.reason) {
        case 'noDataFolder':
          msg.reply(t('commands.typing.error.noDataFolder', locale))
          break

        case 'noLocaleFolder':
          msg.reply(t('commands.typing.error.noLocaleFolder', locale))
          break

        case 'dataContainsUnregisteredGroup':
          msg.reply(t('commands.typing.error.dataContainsUnregisteredGroup', locale))
      }
    } else msg.channel.send(t('commands.typing.loaded', locale))
  }
}

module.exports = TypingGameCommand
