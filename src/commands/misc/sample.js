const Command = require('../_Command')

class SampleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sample',
      aliases: ['ㄴ므ㅔㅣㄷ'],
      group: 'misc'
    })
  }

  async run (_client, msg, _query, { t, tn }) {
    return msg.channel.send('This is a sample command. Copy and paste to create a new command.')
  }
}

module.exports = SampleCommand
