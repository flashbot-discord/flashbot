const { inspect } = require('util')

const Paginator = require('../../structures/Paginator')
const Command = require('../_Command')
const { parsePeriod } = require('../../shared')

class TestCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'test',
      aliases: ['테스트', 'ㅅㄷㄴㅅ', 'xptmxm'],
      group: 'dev',
      owner: true
    })
  }

  * args (msg) {
    const returnObj = {}

    const { cmd } = yield {
      arg: {
        key: 'cmd',
        type: 'string',
        optional: false,
        oneOf: ['parseperiod'] // not working yet
      }
    }
    returnObj.cmd = cmd

    switch (cmd) {
      case 'parseperiod': {
        const { period } = yield {
          unnamed: {
            key: 'period',
            type: 'string',
            optional: false
          }
        }
        returnObj.period = period
      }
    }

    return returnObj
  }

  async run (client, msg, query, _) {
    // Enter your code to test
    const cmd = query.args.cmd

    switch (cmd) {
      case 'parseperiod': {
        const input = query.args.period
        const result = parsePeriod(input)
        console.log(result)
        msg.channel.send(`
\`\`\`
${inspect(result)}
\`\`\``)

        break
      }

      case 'page': {
        const m = await msg.channel.send('Loading...')
        const pg = new Paginator(client, m, {
          contents: [
            'Page 1/2\nhello',
            'Page 2/2\nworld',
            'Page 3/2\nTHIS IS THE SECRET PAGE HAHA'
          ],
          userID: msg.author.id
        })
        pg.start()

        break
      }

      case 'collector': {
        const botMsg = await msg.reply('test')
        await botMsg.react('✅')

        const collector = botMsg.createReactionCollector({ time: 60000 })

        collector.on('collect', () => {
          botMsg.reply('collected')
        })

        collector.on('dispose', () => {
          botMsg.reply('disposed')
        })

        collector.on('end', () => {
          botMsg.reply('ended')
        })

        break
      }

      case 'alwaysbtn': {
        break
      }
    }
  }
}

module.exports = TestCommand
