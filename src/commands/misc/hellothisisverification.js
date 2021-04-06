const Command = require('../_Command')

class DBKRVerifyCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hellothisisverification',
      group: 'misc'
    })
  }

  run (client, msg, _query, _) {
    const owners = client.config.owner.map(id => {
      const u = client.users.resolve(id)
      return `${u.tag} (\`${u.id}\`)`
    })
    console.log(owners)
    msg.reply(`Hello! This is Verification!\nBot Owners: ${owners.join(', ')}`)
  }
}

module.exports = DBKRVerifyCommand
