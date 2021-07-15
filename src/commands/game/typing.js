const path = require('path')
const { MessageCollector } = require('discord.js')
const hangul = require('hangul-js')

const Command = require('../_Command')
const typing = require('../../components/game/typing/game')

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
      arg: {
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
          args: {
            key: 'lang',
            type: 'string',
            optional: true
          }
        }
        returnObj.lang = lang

        const { category } = yield {
          args: {
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
    switch (query.args.cmd) {
      case 'reload':
        if (!client.config.owner.includes(msg.author.id)) return msg.reply(t('commands.typing.error.noPermissionToReload'))

        return this.loadData(msg, t)

      case 'start': {
        // Check if the data is loaded
        if (!typing.isLoaded()) {
          msg.channel.send(t('commands.typing.loading'))
          if (typing.isLoading()) return
          this.loadData(msg, t)
        }

        // Stop when session is present
        if (typing.isPlaying(msg.channel.id)) return msg.channel.send(t('commands.typing.alreadyPlaying'))

        // Choose Language
        let lang = this.default
        if (query.args.lang) {
          const langInput = query.args.lang
          if (typing.isLocaleExist(langInput)) lang = typing.getBaseLocale(langInput)
          else return msg.reply(t('commands.typing.error.langNotExist'))
        }

        // Category select
        let category
        if (query.args.category) {
          const categoryInput = query.args.category
          if (!typing.isCategoryExist(lang, categoryInput)) return msg.reply(t('commands.typing.error.categoryNotExist'))
          else category = categoryInput
        } else category = null

        // Check data
        const data = typing.getData(lang, category)
        if (data == null) return msg.reply(t('commands.typing.error.noDataInCategory'))

        const categoryData = data.category

        let { text } = data
        console.log(data)
        if (data.from) text += ` - ${data.from}`
        const displayText = text.split('').join('\u200b')

        // Make collector and register first to prevent multiple run
        const mc = msg.channel.createMessageCollector((m) => !m.author.bot, { time: 60000 })
        typing.startGame(msg.channel.id, mc)

        await msg.channel.send(t('commands.typing.start', displayText, categoryData.name, categoryData.id))

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
          typing.endGame(msg.channel.id)
        })

        break
      }

      case 'stop':
        this.stop(msg, t)
        break

      case 'category':
        // TODO: display category default copyright here
        if (query.args.searchQuery.length < 1) return msg.reply(t('commands.typing.emptyCategorySearchQuery', query.prefix))
        else return msg.reply('WIP')
    }
  }

  stop (msg, t) {
    if (!typing.isPlaying(msg.channel.id)) return msg.channel.send(t('commands.typing.notPlaying'))

    const session = typing.getSession(msg.channel.id)
    if (session instanceof MessageCollector) {
      session.stop('stopcmd')
      typing.endGame(msg.channel.id)
    }
  }

  loadData (msg, t) {
    if (!typing.isReady()) typing.init(msg.client)

    const result = typing.loadData(this.path)

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
