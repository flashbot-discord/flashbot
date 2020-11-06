const Command = require('../../structures/Command')
const parsePeriod = require('../../modules/parsePeriod')

class TestCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'test',
      aliases: ['테스트', 'ㅅㄷㄴㅅ', 'xptmxm'],
      description: 'commands.test.DESC:Command Testing',
      group: 'dev',
      owner: true
    })
  }

  async run (_client, msg, query, _locale) {
    // Enter your code to test
    const cmd = query.args[0]

    switch (cmd) {
      case 'parseperiod': {
        const input = query.args[1]
        const result = parsePeriod(input)
        console.log(result)
        msg.channel.send(`
\`\`\`
${result}
\`\`\``)
      }
    }
  }
}

module.exports = TestCommand
