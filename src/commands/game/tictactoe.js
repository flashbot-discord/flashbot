const { MessageEmbed } = require('discord.js')

const Command = require('../_Command')
const tictactoe = require('../../components/game/tictactoe/game')
const { modifyPanel } = require('../../components/game/tictactoe/panel')
const ClientError = require('../../structures/ClientError')
const { canSendEmbed } = require('../../components/permissions/checker')

const _logger = require('../../shared/logger')('cmd:tictactoe')

// for test
const PLAY_MYSELF = true

class TicTacToeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tictactoe',
      aliases: ['tic-tac-toe', '틱택토', '샻-ㅅㅁㅊ-샏', '샻ㅅㅁㅊ샏', 'xlrxorxh'],
      group: 'game',
      args: [
        {
          key: 'cmd',
          type: 'string'
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    switch (query.args.cmd) {
      case '시작':
      case 'start':
      case 'tlwkr':
      case 'ㄴㅅㅁㄱㅅ': {
        const logger = _logger.extend('start')

        // Prevent multiple games in one channel
        if (tictactoe.isSessionExist(msg.channel.id)) return msg.channel.send(t('commands.tictactoe.alreadyPlaying'))

        // Start game session
        logger.verbose(`creating session for channel ${msg.channel.id}`)
        tictactoe.createSession(client, msg.channel.id)

        // Wait for game
        const botMsg = await msg.channel.send(t('commands.tictactoe.waiting', msg.author.id))

        await botMsg.react('✅')
        await botMsg.react('❌')

        let action = 'cancel' // 'start', 'cancel'

        // Process reactions
        const collected = await botMsg.awaitReactions((reaction, user) => {
          if (user.bot) return false
          else {
            if (reaction.emoji.name === '✅' && (PLAY_MYSELF ? user.id === msg.author.id : user.id !== msg.author.id)) action = 'start'
            else if (reaction.emoji.name === '❌' && user.id === msg.author.id) action = 'cancel'
            else return false

            return true
          }
        }, { max: 1, time: 20000 })

        if (!tictactoe.isSessionExist(msg.channel.id)) {
          // Cancelled via command. Do nothing.
          logger.verbose(`session for channel ${msg.channel.id} already destroyed via stop command`)
          return
        } else if (collected.size < 1) {
          // No one joined.
          tictactoe.destroySession(msg.channel.id)
          return msg.channel.send(t('commands.tictactoe.noOneJoined'))
        } else if (action === 'cancel') {
          // Cancelled while waiting.
          tictactoe.destroySession(msg.channel.id)
          return msg.reply(t('commands.tictactoe.gameCancelled'))
        } else if (action !== 'start') throw new Error(`Unexpected action value '${action}'`)

        const player2 = collected.first().users.cache.find((u) => u.id !== client.user.id)
        runGame(msg, player2, t)

        break
      }

      case '종료':
      case 'stop':
      case 'whdfy':
      case 'ㄴ새ㅔ': {
        const logger = _logger.extend('stop')

        logger.verbose(`fetching session for channel ${msg.channel.id} to destroy`)
        const session = tictactoe.getSession(msg.channel.id)
        if (session != null) {
          logger.verbose(`session for channel ${msg.channel.id} available. destroying.`)
          session.collector?.stop('stop')
          tictactoe.destroySession(msg.channel.id)
          msg.channel.send(t('commands.tictactoe.gameStopped'))
        } else msg.channel.send(t('commands.tictactoe.error.notPlaying'))

        break
      }

      // Default
      default:
        return msg.reply(t('commands.tictactoe.usage', query.prefix))
    }
  }
}

async function runGame (msg, player2, t) {
  const useEmbed = canSendEmbed(msg.client.user, msg.channel)

  // Host, Guest
  const players = [msg.author, player2]
  const playerIds = players.map((p) => p.id)
  let turn = Math.floor(Math.random() * 2)

  // Winner (for ending process)
  let winner = null

  // Game Panel Data
  let panelData = []

  // Init game panel
  let gamePanel
  if (useEmbed) {
    gamePanel = new MessageEmbed()
      .setTitle(t('commands.tictactoe.game.title'))
  } else gamePanel = ''

  gamePanel = modifyPanel(gamePanel, {
    players,
    turn,
    panelData: []
  }, t)

  // Send panel
  const gamePanelMsg = await msg.channel.send(gamePanel)

  // Message Collector
  const inputCollector = msg.channel.createMessageCollector((m) => {
    if (!playerIds.includes(m.author.id)) return false
    else return validateInput(parseInt(m.content))
  }, { idle: 60000 })

  // Actual game start
  tictactoe.startGame(msg.channel.id, inputCollector)

  // when someone entered a number
  inputCollector.on('collect', (userInput) => {
    if (playerIds[turn] !== userInput.author.id) return
    const result = tictactoe.mark(msg.channel.id, turn, parseInt(userInput.content))
    if (!result.success) {
      try {
        handleError(msg, result.data, t)
      } catch (err) {
        const e = new ClientError(err)
        e.report(msg, t, 'tictactoe:runGame')
      }

      return
    }

    // Change turn
    turn = changeTurn(turn)

    // Check if someone win the game
    const win = result.data.win
    const someoneWin = win === 0 || win === 1 || win === -1

    panelData = result.data.panel

    // Re-generate gamePanel
    gamePanel = modifyPanel(gamePanel, {
      players,
      turn,
      panelData,
      win
    }, t)

    // Finally, update the message
    gamePanelMsg.edit(gamePanel)

    // If someone win, end the game session
    if (someoneWin) {
      winner = players[win]
      if (win === 0 || win === 1) inputCollector.stop('win')
      else if (win === -1) inputCollector.stop('draw')
    }
  })

  // when game ends for some reason
  inputCollector.on('end', (_, reason) => {
    if (reason === 'idle') {
      const winnerTurn = changeTurn(turn)
      winner = players[winnerTurn]

      // Update gamePanel here
      gamePanel = modifyPanel(gamePanel, {
        players,
        turn,
        panelData,
        win: winnerTurn
      }, t)
      gamePanelMsg.edit(gamePanel)

      tictactoe.destroySession(msg.channel.id)
      msg.channel.send(t('commands.tictactoe.game.timeOut', winner.toString()))
    } else if (reason === 'win') {
      msg.channel.send(t('commands.tictactoe.game.win', winner.toString()))
    } else if (reason === 'draw') msg.channel.send(t('commands.tictactoe.game.draw'))
  })
}

function validateInput (position) {
  return typeof position === 'number' &&
    Number.isInteger(position) &&
    position >= 1 &&
    position <= 9
}

function handleError (msg, reason, t) {
  switch (reason) {
    case 'AlreadyMarked':
      msg.reply(t('commands.tictactoe.error.alreadyMarked'))
      break

    case 'InvalidPosition':
      break

    default:
      throw new Error(reason)
  }
}

function changeTurn (turn) {
  if (turn === 0) return 1
  else if (turn === 1) return 0
  else return turn
}

module.exports = TicTacToeCommand
