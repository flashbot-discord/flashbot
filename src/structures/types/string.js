module.exports = {
  type: 'string',
  validate: (msg, el) => ['string', 'number'].includes(typeof el) && String(el).split(' ').length === 1,
  parse: (msg, el) => String(el)
}
