module.exports = {
  type: 'string',
  validate: el => typeof el === 'string',
  parse: el => el
}
