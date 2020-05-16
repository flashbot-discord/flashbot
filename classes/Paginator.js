const { MessageEmbed } = require('discord.js')

class Paginator {
  constructor (client, msg, options) {
    this._client = client
    this.msg = msg
    this.contents = options.contents || ['']
    this.timeout = options.timeout || 30000
    this.ctrlUser = options.userID || ''
    this.page = 0
    this.keepRun = true

    if (!options.emojis) {
      this.reactions = new Map([
        ['first', '⏮️'],
        ['prev', '◀️'],
        ['stop', '⏹️'],
        ['next', '▶️'],
        ['last', '⏭️']
      ])
    }
  }

  emojiChecker (reaction, user) {
    if (user.bot || user.id !== this.ctrlUser) return false
    if (reaction.message.id !== this.msg.id) return false
    if (Array.from(this.reactions.values()).find((r) => r === reaction.emoji.toString())) return true
    return false
  }

  async start () {
    await this.msg.edit(this.contents[0])

    this.reactions.forEach(async (r) => await this.msg.react(r))

    while (this.keepRun) {
      const result = await this.msg.awaitReactions(this.emojiChecker.bind(this), {
        time: this.timeout,
        max: 1
      })

      if (result.size > 0) {
        this.run(result)
      } else this.keepRun = false
    }

    this.stop()
  }

  async run (reactions) {
    const sel = reactions.first()
    const find = Array.from(this.reactions.entries())
      .find((r) => r[1] === sel.emoji.toString())[0]

    switch (find) {
      case 'first':
        this.page = 0
        this.update()
        break

      case 'prev':
        if (this.page < 1) break

        this.page--
        this.update()
        break

      case 'stop':
        this.stop()
        return

      case 'next':
        if (this.page - 1 >= this.contents.length) break

        this.page++
        this.update()
        break

      case 'last':
        this.page = this.contents.length - 1
        this.update()
    }

    const users = await sel.users.fetch()
    Array.from(users.keys())
      .filter((id) => id !== this._client.user.id)
      .forEach((userid) => {
        sel.users.remove(userid)
      })
  }

  update () {
    if (this.contents[this.page] instanceof MessageEmbed) this.msg.edit({ embed: this.contents[this.page] })
    else this.msg.edit({ content: this.contents[this.page] })
  }

  stop () {
    this.keepRun = false
    const botReactions = this.msg.reactions.cache.filter((r) => Array.from(this.reactions.values()).includes(r.emoji.toString()))
    botReactions.forEach((r) => {
      r.users.remove(this._client.user)
    })
  }
}

module.exports = Paginator
