class MsgQuery {
  constructor (content, prefix, calledByMention) {
    this.raw = content
    this.prefix = prefix
    this.content = content.slice(prefix.length)

    if (!calledByMention && (!this.content || this.content.length < 1)) return

    this.arr = this.content.split(' ').filter((c) => c.length > 0)
    if (calledByMention && this.arr.length < 1) this.arr = ['hello']
    this.cmd = this.arr[0]
    this.args = splitDoubleQuotes(this.arr.slice(1))
  }
}

function splitDoubleQuotes (args = []) {
  const newArgs = []
  const queue = []

  args.forEach((arg) => {
    if (arg.startsWith('"')) return queue.push(arg)
    else if (arg.endsWith('"') && !arg.endsWith('\\"')) {
      queue.push(arg)
      newArgs.push(queue.join(' ').slice(1, -1))
      queue.length = 0
    } else {
      if (queue.length > 0) queue.push(arg)
      else newArgs.push(arg)
    }
  })

  if (queue.length > 0) {
    queue.forEach((element) => newArgs.push(element))
  }

  return newArgs
}

module.exports = MsgQuery
