module.exports = {
  type: 'boolean',
  validate: (msg, el) => typeof el === 'boolean',
  parse: (msg, el) => el // minimist parses this
}
