module.exports = {
  type: 'number',
  validate: el => typeof el === 'number',
  parse: el => el // minimist parses this actually
}
