class MsgQuery {
  constructor (client, msg) {
    this.raw = msg.content
    this.content = msg.content.split(client.config.prefix)[1]
    if (!this.content || this.content.length < 1) return

    this.arr = this.content.split(' ')
    this.cmd = this.arr[0]
    this.args = this.arr.slice(1)
  }
}

module.exports = MsgQuery
