const Command = require('../../structures/Command')

class DiceCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dice',
      aliases: ['주사위', '얓ㄷ', 'wntkdnl'],
      description: 'commands.dice.DESC',
      group: 'util'
    })
  }

  async run (client, msg, query, { t }) {
    let sides = 6
    if (query.args.length > 0) {
      const input = query.args[0]
      if (
        !/^[0-9]+$/.test(input) ||
        parseInt(input) < 1
      ) return msg.reply(t('commands.dice.error'))
      else sides = parseInt(input)
    }

    // Random
    const randNum = Math.floor(Math.random() * (sides - 1)) + 1
    return msg.channel.send(':game_die: ' + t('commands.dice.result', sides, randNum))
  }
}

module.exports = DiceCommand
