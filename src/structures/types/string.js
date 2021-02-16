module.exports = {
  type: 'string',
  validate: (msg, el) => typeof el === 'string' && el.split(' ').length === 1,
  parse: (msg, el) => el
}
