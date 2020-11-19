const regexp = /^\d{17,19}$/

module.exports = {
  type: 'snowflake',
  validate: el => regexp.test(el),
  parse: el => el
}
