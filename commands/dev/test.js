const Command = require('../../classes/Command')

class TestCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'test',
      aliases: ['테스트', 'ㅅㄷㄴㅅ', 'xptmxm'],
      description: 'Command Testing',
      ownerOnly: true
    })
  }

  async run (msg) {
    // Enter your code to test
    return msg.channel.send('testing the command')
  }
}

module.exports = TestCommand
