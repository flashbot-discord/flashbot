const should = require('chai').should()

const argRunner = require('../src/structures/command/arguments/ArgumentRunner')
const ArgumentError = require('../src/structures/command/arguments/ArgumentError')

describe('Running argument', function () {
  let msg
  let command

  beforeEach(function () {
    msg = {}
    command = {
      _args: {
        named: {},
        unnamed: []
      }
    }
  })

  describe('by types', function () {
    describe('any', function () {
      it('should not fail', async function () {
        command._args.unnamed.push({
          key: 'something',
          type: 'any'
        })
        const result = await argRunner.runArgs(msg, command, ['test'])
        result
          .should.have.property('something', 'test')
      })
    })

    describe('string', function () {
      it('should success', async function () {
        command._args.unnamed.push({
          key: 'something',
          type: 'string'
        })
        const result = await argRunner.runArgs(msg, command, ['asdf'])
        result
          .should.have.property('something', 'asdf')
      })

      it('number should be casted to string', async function () {
        command._args.unnamed.push({
          key: 'hmmteresting',
          type: 'string'
        })
        const input = ['245245245']
        const result = await argRunner.runArgs(msg, command, input)
        result
          .should.have.property('hmmteresting', '245245245')
      })
    })

    describe('number', function () {
      it('should success', async function () {
        command._args.unnamed.push({
          key: 'digits',
          type: 'number'
        })

        const input = ['337283']
        const result = await argRunner.runArgs(msg, command, input)
        result
          .should.have.property('digits', 337283)
      })

      it('should fail', async function () {
        command._args.unnamed.push({
          key: 'what',
          type: 'number'
        })

        const input = ['thisisString']
        const func = async () => await argRunner.runArgs(msg, command, input)

        console.log(func())

        func
          .should.throw(ArgumentError, 'argument type mismatch')
      })
    })
  })

  describe('named arguments', function () {
    // //cmd --test asdf
    it('string', async function () {
      command._args.named = {
        test: {
          type: 'string'
        }
      }

      const input = '--test asdf'.split(' ')
      const result = await argRunner.runArgs(msg, command, input)
      result
        .should.have.property('test', 'asdf')
    })

    // //cmd --test asdf --another
    it('multiple args', async function () {
      command._args.named = {
        test: {
          type: 'string'
        },
        another: {
          type: 'boolean'
        }
      }

      const input = '--test lol --another'.split(' ')
      const result = await argRunner.runArgs(msg, command, input)
      result
        .should.have.property('test', 'lol')
      result
        .should.have.property('another', true)
    })
  })

  describe('unnamed arguments', function () {
    // //cmd testarg
    it('string', async function () {
      command._args.unnamed = [
        {
          key: 'test',
          type: 'string'
        }
      ]

      const input = 'testarg'.split(' ')
      const result = await argRunner.runArgs(msg, command, input)
      result
        .should.have.property('test', 'testarg')
    })

    // //cmd lol cat 5252
    it('multiple args', async function () {
      command._args.unnamed = [
        {
          key: 'test',
          type: 'string'
        },
        {
          key: 'another',
          type: 'string'
        },
        {
          key: 'num',
          type: 'number'
        }
      ]

      const input = 'lol cat 5252'.split(' ')
      const result = await argRunner.runArgs(msg, command, input)
      result
        .should.have.property('test', 'lol')
      result
        .should.have.property('another', 'cat')
      result
        .should.have.property('num', 5252)
    })

    it('should throw error if same key defined more than once', async function () {

    })
  })

  describe('dynamic arg parsing', function () {
    beforeEach(function () {
      command._args.dynamic = true
    })

    it('simple', async function () {
      command.args = function * () {
        yield {
          unnamed: {
            key: 'hello',
            type: 'string'
          }
        }
      }

      const input = 'world'.split(' ')
      console.log(input)
      const result = await argRunner.runArgs(msg, command, input)
      result
        .should.have.property('hello', 'world')
    })

    it('multiple args', async function () {
      command.args = function * () {
        yield {
          unnamed: {
            key: 'hello',
            type: 'string'
          }
        }

        yield {
          unnamed: {
            key: 'another',
            type: 'number'
          }
        }
      }

      const input = 'hey 1234'.split(' ')
      console.log(input)
      const result = await argRunner.runArgs(msg, command, input)
      result
        .should.have.property('hello', 'hey')
      result
        .should.have.property('another', 1234)
    })

    it('should throw error if multiple args defined with the same key', async function () {
      command.args = function * () {
        yield {
          unnamed: {
            key: 'duplicated',
            type: 'string'
          }
        }

        yield {
          unnamed: {
            key: 'duplicated',
            type: 'number'
          }
        }
      }

      const input = 'holy 9999'.split(' ')
      console.log(input)
      const result = await argRunner.runArgs(msg, command, input)
      result
        .should.throw('multiple unnamed args defined with the same key')
    })
  })
})
