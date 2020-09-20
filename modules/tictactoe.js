const { Collection, MessageCollector } = require('discord.js')

const sessions = new Collection()

const prepareGame = (channelid) => sessions.set(channelid, 'preparing')
function startGame (channelid, collector) {
  const emptyBoard = []
  emptyBoard.length = 9
  emptyBoard.fill(null)

  sessions.set(channelid, {
    board: emptyBoard,
    collector
  })
}
const endGame = (channelid) => sessions.delete(channelid)

const isGamePlaying = (channelid) => sessions.has(channelid) && sessions.get(channelid) instanceof MessageCollector
const getSession = (channelid) => sessions.get(channelid)

function mark (channelid, player, position) {
  // Validate value
  if (!isVaildPlayer(player)) return makeResultObj(false, 'InvalidPlayer')
  else if (
    typeof position !== 'number' ||
    !Number.isInteger(position) ||
    position < 1 ||
    position > 9
  ) return makeResultObj(false, 'InvalidPosition')

  if (!sessions.has(channelid)) return makeResultObj(false, 'NotPlaying')
  const session = sessions.get(channelid)

  // Already marked?
  if (session.board[position - 1] != null) return makeResultObj(false, 'AlreadyMarked')

  // Mark it
  session.board[position - 1] = player

  // Check winning conditions
  let win = checkWin(session.board)
  if (isVaildPlayer(win)) endGame(channelid)
  else if (session.board.every(isVaildPlayer)) {
    // Tie
    win = -1
    endGame(channelid)
  }
  
  return makeResultObj(true, {
    panel: session.board,
    collector: session.collector,
    win,
  })
}

/**
 * @private
 */
function isVaildPlayer (player) {
  return player === 0 || player === 1
}

/**
 * @private
 */
function makeResultObj (success, data) {
  return { success, data }
}

/**
 * @private
 */
function checkWin (session) {
  // Horizontial row
  for (let i = 0; i < 7; i += 3) {
    if (session[i] === session[i + 1] && session[i + 1] === session[i + 2]) return session[i]
  }

  // Vertical row
  for (let i = 0; i < 3; i++) {
    if (session[i] === session[i + 3] && session[i + 3] === session[i + 6]) return session[i]
  }

  // Diagonal row
  if (
    (session[0] === session[4] && session[4] === session[8]) ||
    (session[2] === session[4] && session[4] === session[6])
  ) return session[4]

  // Not Found
  return null
}

module.exports = {
  prepareGame,
  startGame,
  endGame,
  isGamePlaying,
  getSession,
  mark
}
