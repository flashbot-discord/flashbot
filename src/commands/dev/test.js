const { inspect } = require('util')

const Command = require('../_Command')
const parsePeriod = require('../../modules/parsePeriod')

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
      unnamed: {
        key: 'cmd',
        type: 'string',
        optional: false,
        oneOf: ['parseperiod']
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

  async run (_client, msg, query, _) {
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
      }
    }
  }
}

module.exports = TestCommand
