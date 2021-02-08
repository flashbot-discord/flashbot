const regexId = /^\d{17,19}$/
const regexMention = /^<@(?:!)?(\d{17,19})>$/

module.exports = {
  type: 'member',
  validate: (msg, el) => {
    if (typeof el !== 'string') return false

    return regexId.test(el) || regexMention.test(el)
  },
  parse: async (msg, el) => {
    let isMention
    if (regexId.test(el)) isMention = false
    else if (regexMention.test(el)) isMention = true
    else return null

    const id = isMention ? regexMention.exec(el)[1] : el
    let user
    try {
      user = await msg.guild.members.fetch(id)
    } catch (e) { user = null }

    return user
  }
}
