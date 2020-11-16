const Command = require('../_Command')

class DiceCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dice',
      aliases: ['주사위', '얓ㄷ', 'wntkdnl'],
      description: 'commands.dice.DESC',
      group: 'util',
      args: [
        {
          key: 'sides',
          type: 'number',
          optional: true
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    let sides = 6
    if (query.args.sides != null) {
      const input = query.args.sides
      if (input < 1) return msg.reply(t('commands.dice.error'))
      else sides = input
    }

    // Random
    const randNum = Math.floor(Math.random() * (sides - 1)) + 1
    return msg.channel.send(':game_die: ' + t('commands.dice.result', sides, randNum))
  }
}

module.exports = DiceCommand
