const regex = /^<@&(\d{17,19})>$/

module.exports = {
  type: 'role',
  validate: (msg, el) => typeof el === 'string' && regex.test(el),
  parse: async (msg, el) => {
    const id = regex.exec(el)[1]
    if (!id) return null

    let role
    try {
      role = await msg.guild.roles.fetch(id)
    } catch (e) { role = null }

    return role
  }
}
