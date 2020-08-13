class MsgQuery {
  constructor (content, prefix) {
    this.raw = content
    this.content = content.slice(prefix.length)
    if (!this.content || this.content.length < 1) return

    this.arr = this.content.split(' ').filter((c) => c.length > 0)
    this.cmd = this.arr[0]
    this.args = splitDoubleQuotes(this.arr.slice(1))
  }
}

function splitDoubleQuotes (args) {
  const newArgs = []
  const queue = []

  for (arg of args) {
    if (arg.startsWith('"')) {
      queue.push(arg)
      continue
    } else if (arg.endsWith('"') && !arg.endsWith('\\"')) {
      queue.push(arg)
      newArgs.push(queue.join(' ').slice(1, -1))
      queue.length = 0
    } else {
      if (queue.length > 0) queue.push(arg)
      else newArgs.push(arg)
    }
  }

  if (queue.length > 0) {
    for (element of queue) newArgs.push(element)
  }

  console.log(newArgs)
  return newArgs
}

module.exports = MsgQuery
