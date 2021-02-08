const regex = /^<#(\d{17,19})>$/

module.exports = {
  type: 'channel',
  validate: (msg, el) => typeof el === 'string' && regex.test(el),
  parse: async (msg, el) => {
    const id = regex.exec(el)[1]
    if (!id) return null

    let channel
    try {
      channel = await msg.client.channels.fetch(id)
    } catch (e) { channel = null }

    return channel
  }
}
