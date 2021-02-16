module.exports = {
  type: 'number',
  validate: (msg, el) => typeof Number(el) === 'number' && !isNaN(Number(el)),
  parse: (msg, el) => Number(el) // minimist parses this actually
}
