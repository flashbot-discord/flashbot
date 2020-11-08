const Command = require('../../structures/Command')

class BlacklistCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'blacklist',
      aliases: ['블랙리스트', '블랙', 'ㅠㅣㅁ차ㅣㅑㄴㅅ', 'qmfforfltmxm', 'qmffor'],
      description: 'commands.blacklist.DESC:Blacklist',
      group: 'dev',
      owner: true
    })
  }

  async run (client, msg, query, { t }) {
    if (['추가', 'add'].includes(query.args[0])) {

    }
  }
}

module.exports = BlacklistCommand
