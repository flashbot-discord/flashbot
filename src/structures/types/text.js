module.exports = {
  type: 'text',
  validate: (msg, el) => typeof el === 'string',
  parse: (msg, el) => el
}
