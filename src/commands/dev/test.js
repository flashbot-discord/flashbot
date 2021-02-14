const { inspect } = require('util')

const Command = require('../_Command')
const parsePeriod = require('../../modules/parsePeriod')

class TestCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'test',
      aliases: ['테스트', 'ㅅㄷㄴㅅ', 'xptmxm'],
      description: 'commands.test.DESC:Command Testing',
      group: 'dev',
      owner: true,/*
      args: [
        {
          key: 'cmd',
          type: 'string',
          optional: false
        }
      ]*/
    })
  }

  *args (msg) {
    const { cmd } = yield {
      unnamed: {
        key: 'cmd',
        type: 'string',
        optional: false,
        oneOf: ['parseperiod']
      }
    }
console.log(cmd)
    switch (cmd) {
      case 'parseperiod': {
        const { period } = yield {
          unnamed: {
            key: 'value',
            type: 'string',
            optional: false
          }
        }
        return { cmd, period }
      }
    }
  }

  async run (_client, msg, query, _) {
    console.log(query)
    // Enter your code to test
    const cmd = query.args.cmd

    switch (cmd) {
      case 'parseperiod': {
        const input = query.args.value
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
