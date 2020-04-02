const Command = require('../../classes/Command')
const util = require('util')

class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'eval',
      aliases: ['evaluate', 'ㄷㅍ미', 'ㄷㅍ미ㅕㅁㅅㄷ'],
      description: 'commands.eval.DESC:Evaluates a code.',
      owner: true,
      args: [
        {
          name: 'commands.eval.args.code.NAME:code',
          type: 'common.string:string',
          description: 'commands.eval.args.code.DESC:The code to evaluate.'
        }
      ]
    })
  }

  async run(client, msg, query, locale) {
    const str = query.args.join(' ')
    if(!str) return await msg.reply(Command.makeUsage(this, query.cmd, locale))
    client.logger.log('Command / Eval', '[EVAL] ' + msg.author.tag + ' evaluated the code: ' + str)

    let result

    // Temporaily remove token from visible area
    let __BACKUP__DATA__ = {}
    Object.defineProperty(__BACKUP__DATA__, '__SECRET__DATA__', {
      value: client.config.token
    })
    client.config.token = '403 Forbidden'
    
    try {
      result = util.inspect(eval(str), {depth: 0})
    } catch(err) {
      result = err.message
    }

    // Restore token
    client.config.token = __BACKUP__DATA__.__SECRET__DATA__
    __BACKUP__DATA__ = null

    client.logger.debug('Command / Eval', '[EVAL] Result: ' + result)
    return await msg.reply(client.locale.t('commands.eval.input:Input:', locale) + '```\n'
      + str + '\n```\n' 
      + client.locale.t('commands.eval.output:and Output:', locale) + '```\n'
      + result + '\n```')
  }
}

module.exports = EvalCommand
