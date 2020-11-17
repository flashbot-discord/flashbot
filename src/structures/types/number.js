module.exports = {
  type: 'number',
  validate: el => typeof Number(el) === 'number' && !isNaN(Number(el)),
  parse: el => Number(el) // minimist parses this actually
}
