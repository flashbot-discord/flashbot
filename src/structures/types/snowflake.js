const regex = /^\d{17,19}$/

module.exports = {
  type: 'snowflake',
  validate: (msg, el) => regex.test(el),
  parse: (msg, el) => el
}
