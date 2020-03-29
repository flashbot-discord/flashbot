const Command = require('../../classes/Command')
const util = require('util')

class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'eval',
      owner: true
    })
  }

  async run(client, msg, query, locale) {
    console.log(query)
    const str = query.args.join(' ')
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
    return await msg.reply(client.locale.t('commands.eval.result.output', locale) + ': ```\n' + result + '\n```')
  }
}

module.exports = EvalCommand
