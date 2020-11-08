const { MessageEmbed } = require('discord.js')
const Command = require('../../structures/Command')
const tictactoeModule = require('../../modules/tictactoe')
const ClientError = require('../../structures/ClientError')

class TicTacToeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tictactoe',
      aliases: ['tic-tac-toe', '틱택토', '샻-ㅅㅁㅊ-샏', '샻ㅅㅁㅊ샏', 'xlrxorxh'],
      description: 'commands.tictactoe.DESC',
      group: 'game'
    })
  }

  async run (client, msg, query, { t }) {
    const cmd = query.args[0]

    switch (cmd) {
      case '시작':
      case 'start':
      case 'tlwkr':
      case 'ㄴㅅㅁㄱㅅ': {
        // Start game session
        tictactoeModule.prepareGame(msg.channel.id)

        // Wait for game
        const botMsg = await msg.channel.send(t('commands.tictactoe.waiting', msg.author.id))

        await botMsg.react('✅')
        await botMsg.react('❌')

        let action = 'cancel' // 'start', 'cancel'

        // Process reactions
        const collected = await botMsg.awaitReactions((reaction, user) => {
          if (user.bot) return false
          else {
            if (reaction.emoji.name === '✅' && user.id !== msg.author.id) action = 'start'
            else if (reaction.emoji.name === '❌' && user.id === msg.author.id) action = 'cancel'
            else return false

            return true
          }
        }, { max: 1, time: 20000 })

        // Cancel process
        if (collected.size < 1) {
          tictactoeModule.endGame(msg.channel.id)
          return msg.channel.send(t('commands.tictactoe.noOneJoined'))
        } else if (action === 'cancel') {
          tictactoeModule.endGame(msg.channel.id)
          return msg.reply(t('commands.tictactoe.gameCancelled'))
        } else if (action === 'manual') {
          tictactoeModule.endGame(msg.channel.id)
        } else if (action !== 'start') throw new Error(`Unexpected action value '${action}'`)

        const player2 = collected.first().users.cache.find((u) => u.id !== client.user.id)
        runGame(msg, player2, t)
        break
      }

      case '종료':
      case 'stop':
      case 'whdfy':
      case 'ㄴ새ㅔ':
        if (tictactoeModule.isGamePlaying(msg.channel.id)) {
          tictactoeModule.getSession().collector.stop('manual')
          msg.channel.send(t('commands.tictactoe.gameStopped'))
        } else msg.channel.send(t('commands.tictactoe.error.notPlaying'))

        break

      // Default
      default:
        return msg.reply(t('commands.tictactoe.usage', query.prefix))
    }
  }
}

async function runGame (msg, player2, t) {
  const useEmbed = msg.channel.permissionsFor(msg.client.user).has('EMBED_LINKS')

  // Host, Guest
  const players = [msg.author, player2]
  const playerIds = players.map((p) => p.id)
  let turn = Math.floor(Math.random() * 2)

  // Init game panel
  let gamePanel
  if (useEmbed) {
    gamePanel = new MessageEmbed()
      .setTitle(t('commands.tictactoe.game.title'))
  } else gamePanel = ''

  gamePanel = modifyGamePanel(gamePanel, {
    players,
    turn,
    panelData: []
  }, t)

  const gamePanelMsg = await msg.channel.send(gamePanel)

  // Winner (for ending process)
  let winner = null

  // Game Panel Data
  let panelData = []

  // Message Collector
  const inputCollector = msg.channel.createMessageCollector((m) => {
    if (!playerIds.includes(m.author.id)) return false
    else return validateInput(parseInt(m.content))
  }, { idle: 60000 })

  // Actual game start
  tictactoeModule.startGame(msg.channel.id, inputCollector)

  inputCollector.on('collect', (userInput) => {
    if (playerIds[turn] !== userInput.author.id) return
    const result = tictactoeModule.mark(msg.channel.id, turn, parseInt(userInput.content))
    if (!result.success) {
      try {
        handleError(msg, result.data, t)
      } catch (err) {
        const e = new ClientError(err)
        e.report(msg, t, 'Commands / tictactoe#runGame()')
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
    gamePanel = modifyGamePanel(gamePanel, {
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

  inputCollector.on('end', (_, reason) => {
    if (reason === 'idle') {
      winner = players[changeTurn(turn)]

      // Update gamePanel here
      gamePanel = modifyGamePanel(gamePanel, {
        players,
        turn,
        panelData,
        win: changeTurn(turn)
      }, t)
      gamePanelMsg.edit(gamePanel)

      msg.channel.send(t('commands.tictactoe.game.timeOut', winner.toString()))
    } else if (reason === 'win') {
      msg.channel.send(t('commands.tictactoe.game.win', winner.toString()))
    } else msg.channel.send(t('commands.tictactoe.game.draw'))
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

function formatPanelNum (panel) {
  let str = ''
  const defaultNum = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

  for (let i = 1; i <= 9; i++) {
    switch (panel[i - 1]) {
      case 0:
        str += '❌'
        break

      case 1:
        str += '⭕'
        break

      default:
        str += `:${defaultNum[i - 1]}:`
    }

    if (i % 3 === 0) str += '\n'
    else str += ' '
  }

  return str
}

function modifyGamePanel (panel, data, t) {
  const { players, turn, win, panelData } = data
  const useEmbed = panel instanceof MessageEmbed
  const panelNum = formatPanelNum(panelData)
  const someoneWin = win === 0 || win === 1 || win === -1

  let statusText = ''
  if (someoneWin) {
    statusText = win !== -1
      ? t('commands.tictactoe.game.description.win', players[win].toString())
      : t('commands.tictactoe.game.description.draw')
  } else statusText = t('commands.tictactoe.game.description.playing', players[turn].toString())

  const panelContentText = t('commands.tictactoe.game.description.content', ...players.map(p => p.toString()))

  const panelText = `
${statusText}

${panelContentText}

${panelNum}
  `

  if (useEmbed) {
    panel.setDescription(panelText)
  } else {
    panel = panelText
  }

  return panel
}

function changeTurn (turn) {
  if (turn === 0) return 1
  else if (turn === 1) return 0
  else return turn
}

module.exports = TicTacToeCommand
