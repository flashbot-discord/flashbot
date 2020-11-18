const regexp = /^<@&(\d{17,19})>$/

module.exports = {
  type: 'roleMention',
  validate: el => typeof el === 'string' && regexp.test(el),
  parse: el => regexp.exec(el)[1]
}
