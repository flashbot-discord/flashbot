module.exports = {
  type: 'boolean',
  validate: el => typeof el === 'boolean',
  parse: el => el // minimist parses this
}
