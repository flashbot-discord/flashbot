const path = require('path')
const { MessageCollector } = require('discord.js')
const hangul = require('hangul-js')

const Command = require('../_Command')
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
      group: 'game'
    })

    this.default = 'ko_KR'
    this.path = path.join(path.resolve(), 'data', 'typing')
    this._logPos = 'Command / typing'
  }

  * args () {
    const returnObj = {}

    const { cmd } = yield {
      unnamed: {
        key: 'cmd',
        type: 'string'
      }
    }

    switch (cmd) {
      case 'reload':
      case '리로드':
      case 'ㄱ디ㅐㅁㅇ':
      case 'flfhem':
        returnObj.cmd = 'reload'
        break

      case 'start':
      case '시작':
      case 'ㄴㅅㅁㄱㅅ':
      case 'tlwkr': {
        returnObj.cmd = 'start'

        const { lang } = yield {
          unnamed: {
            key: 'lang',
            type: 'string',
            optional: true
          }
        }
        returnObj.lang = lang

        const { category } = yield {
          unnamed: {
            key: 'category',
            type: 'string',
            optional: true
          }
        }
        returnObj.category = category

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
        returnObj.cmd = 'stop'
        break

      case '카테고리':
      case 'category':
      case 'zkxprhfl':
      case 'ㅊㅁㅅㄷ해교': {
        returnObj.cmd = 'category'

        const { searchQuery } = yield {
          unnamed: {
            key: 'searchQuery',
            type: 'string'
          }
        }
        returnObj.searchQuery = searchQuery

        break
      }
    }

    return returnObj
  }

  async run (client, msg, query, { t }) {
    // TODO args support
    switch (query.args.cmd) {
      case 'reload':
        if (!client.config.owner.includes(msg.author.id)) return msg.reply(t('commands.typing.error.noPermissionToReload'))

        return this.loadData(msg, t)

      case 'start': {
        // Check if the data is loaded
        if (!typingModule.isLoaded()) {
          msg.channel.send(t('commands.typing.loading'))
          if (typingModule.isLoading()) return
          this.loadData(msg, t)
        }

        // Stop when session is present
        if (typingModule.isPlaying(msg.channel.id)) return msg.channel.send(t('commands.typing.alreadyPlaying'))

        // Choose Language
        let lang = this.default
        if (query.args.lang) {
          const langInput = query.args.lang
          if (typingModule.isLocaleExist(langInput)) lang = typingModule.getBaseLocale(langInput)
          else return msg.reply(t('commands.typing.error.langNotExist'))
        }

        // Category select
        let category
        if (query.args.category) {
          const categoryInput = query.args.category
          if (!typingModule.isCategoryExist(lang, categoryInput)) return msg.reply(t('commands.typing.error.categoryNotExist'))
          else category = categoryInput
        } else category = null

        // Check data
        const data = typingModule.getData(lang, category)
        if (data == null) return msg.reply(t('commands.typing.error.noDataInCategory'))

        const categoryData = data.category
        const copyright = data.from ? data.from : (categoryData.fromDefault ? categoryData.fromDefault : t('commands.typing.noCopyright'))

        const { text } = data
        const displayText = text.split('').join('\u200b')

        // Make collector and register first to prevent multiple run
        const mc = msg.channel.createMessageCollector((m) => !m.author.bot, { time: 60000 })
        typingModule.startGame(msg.channel.id, mc)

        await msg.channel.send(t('commands.typing.start', displayText, categoryData.name, categoryData.id, copyright))

        // Timer start
        const startTime = Date.now()

        mc.on('collect', (m) => {
          if (m.content === displayText) return msg.channel.send('<@' + m.author.id + '>, ' + t('commands.typing.doNotCopyPaste'))

          if (m.content !== text) return // msg.channel.send('<@' + m.author.id + '>, ' + t('commands.typing.notMatch', locale))

          const time = (Date.now() - startTime) / 1000
          const ta = Math.round(hangul.d(text).length / time * 60)
          msg.channel.send('<@' + m.author.id + '>, ' + t('commands.typing.correct', time, ta))
          mc.stop('correct')
        })

        mc.on('end', (_, reason) => {
          if (reason === 'stopcmd') msg.channel.send(t('commands.typing.cmdStop'))
          else if (reason !== 'correct') msg.channel.send(t('commands.typing.finish'))

          // remove channel from session storage
          typingModule.endGame(msg.channel.id)
        })

        break
      }

      case 'stop':
        this.stop(msg, t)
        break

      case 'category':
        console.log(query.rawArgs)
        if (!query.rawArgs[1]) return msg.reply(t('commands.typing.emptyCategorySearchQuery', query.prefix))
        else return msg.reply('WIP')
    }
  }

  stop (msg, t) {
    if (!typingModule.isPlaying(msg.channel.id)) return msg.channel.send(t('commands.typing.notPlaying'))

    const session = typingModule.getSession(msg.channel.id)
    if (session instanceof MessageCollector) {
      session.stop('stopcmd')
      typingModule.endGame(msg.channel.id)
    }
  }

  loadData (msg, t) {
    if (!typingModule.isReady()) typingModule.init(msg.client)

    const result = typingModule.loadData(this.path)

    if (!result.success) {
      // TODO Only report this to console and support server error log channel
      switch (result.reason) {
        case 'noDataFolder':
          msg.reply(t('commands.typing.error.noDataFolder'))
          break

        case 'noLocaleFolder':
          msg.reply(t('commands.typing.error.noLocaleFolder'))
          break

        case 'dataContainsUnregisteredGroup':
          msg.reply(t('commands.typing.error.dataContainsUnregisteredGroup'))
      }
    } else msg.channel.send(t('commands.typing.loaded'))
  }
}

module.exports = TypingGameCommand
