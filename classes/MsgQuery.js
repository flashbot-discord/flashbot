class MsgQuery {
  constructor (client, msg) {
    this.raw = msg.content
    if (!msg.content.startsWith(client.config.prefix)) return
    this.content = msg.content.slice(client.config.prefix.length)
    if (!this.content || this.content.length < 1) return

    this.arr = this.content.split(' ').filter((c) => c.length > 0)
    this.cmd = this.arr[0]
    this.args = this.arr.slice(1)
  }
}

module.exports = MsgQuery
