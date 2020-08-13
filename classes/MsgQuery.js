class MsgQuery {
  constructor (msg, prefix) {
    this.raw = msg.content
    this.content = msg.content.slice(prefix.length)
    if (!this.content || this.content.length < 1) return

    this.arr = this.content.split(' ').filter((c) => c.length > 0)
    this.cmd = this.arr[0]
    this.args = this.arr.slice(1)
  }
}

module.exports = MsgQuery
