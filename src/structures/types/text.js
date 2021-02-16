module.exports = {
  type: 'text',
  validate: (msg, el) => typeof el === 'string' && el.length > 0,
  parse: (msg, el) => el
}
