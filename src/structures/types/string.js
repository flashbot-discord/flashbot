module.exports = {
  type: 'string',
  validate: el => typeof el === 'string' && el.split(' ').length === 1,
  parse: el => el
}
