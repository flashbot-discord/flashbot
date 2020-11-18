const regexp = /^<@(?:!)?(\d{17,19})>$/

module.exports = {
  type: 'userMention',
  validate: el => typeof el === 'string' && regexp.test(el),
  parse: el => regexp.exec(el)[1]
}
