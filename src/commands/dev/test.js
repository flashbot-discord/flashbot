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
      owner: true,
      args: [
        {
          key: 'cmd',
          type: 'string',
          optional: false
        }
      ]
    })
  }

  async run (_client, msg, query, _) {
    console.log(query)
    // Enter your code to test
    const cmd = query.args.cmd

    switch (cmd) {
      case 'parseperiod': {
        const input = query.rawArgs[1]
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
