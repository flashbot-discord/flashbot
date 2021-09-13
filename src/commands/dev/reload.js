const Command = require('../_Command')
const makeCommandUsage = require('../../structures/command/usage')

class ReloadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'reload',
      aliases: ['리로드', 'ㄱ디ㅐㅁㅇ', 'flfhem'],
      group: 'dev',
      owner: true
    })
  }

  * args () {
    const returnObj = {}

    const { all, command } = yield {
      flags: {
        all: {
          type: 'boolean',
          aliases: ['a']
        }
      },
      arg: {
        key: 'command',
        type: 'string',
        optional: true
      }
    }

    returnObj.all = all
    returnObj.command = command
    if (!all) {
      if (command) returnObj.command = command
    }

    return returnObj
  }

  async run (client, msg, query, { t }) {
    if (!query.args.all && !query.args.command) {
      return msg.reply(makeCommandUsage(msg, this, query, t, null, true))
    }

    if (query.args.all) {
      const list = client.commands.commands.clone()
      const errCmds = []
      list.forEach(cmd => {
        try {
          cmd.reload()
        } catch (e) {
          errCmds.push(cmd._name)
        }
      })

      const successCmdCount = list.size - errCmds.length

      // TODO: English plural text support
      let result = t('commands.reload.allReload.result', list.size, successCmdCount)
      if (errCmds.length > 0) result += '\n' + t('commands.reload.allReload.failedCmds', errCmds.length, errCmds.join('`, `'))

      return msg.reply({ content: result })
    }

    const input = query.args.command
    const cmd = client.commands.get(input)
    if (!cmd) return msg.reply({ content: t('commands.reload.cannotfind', input) })

    cmd.reload()
    return msg.reply({ content: t('commands.reload.reloaded', cmd._name) })
  }
}

module.exports = ReloadCommand
