const { MessageEmbed } = require('discord.js')

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

function modifyPanel (panel, data, t) {
  const { players, turn, win, panelData } = data
  const useEmbed = panel instanceof MessageEmbed
  const panelNum = formatPanelNum(panelData)
  const someoneWin = win === 0 || win === 1 || win === -1

  let statusText = ''
  if (someoneWin) {
    statusText = win !== -1
      ? t('components.game.tictactoe.panel.win', players[win].toString())
      : t('components.game.tictactoe.panel.draw')
  } else statusText = t('components.game.tictactoe.panel.playing', players[turn].toString())

  const panelContentText = `${players[0].toString()} :x:\n${players[1].toString()} :o:`

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

module.exports = {
  modifyPanel
}
