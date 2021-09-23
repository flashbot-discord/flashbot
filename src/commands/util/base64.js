const Command = require('../_Command')

class Base64Command extends Command {
  constructor (client) {
    super(client, {
      name: 'base64',
      aliases: ['b64'],
      group: 'util',
      args: [
        {
          key: 'cmd',
          type: 'string'
        },
        {
          key: 'value',
          type: 'text'
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    switch (query.args.cmd) {
      case 'e':
      case 'encode':
        await msg.reply(Buffer.from(query.args.value).toString('base64'))
        break

      case 'd':
      case 'decode':
        await msg.reply(Buffer.from(query.args.value, 'base64').toString())
          .catch(e => {
            msg.react('⚠️')
            msg.reply(t('commands.base64.emptyMsg'))
          })
    }
  }
}

module.exports = Base64Command
