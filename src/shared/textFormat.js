exports.hasEveryoneMention = (text) => {
  return /@(everyone|here)/.test(text)
}

exports.cleanMarkdown = (text) => {
  // TODO WIP
  return text
}

exports.joinBacktick = (arr) => {
  return `\`${arr.join('`, `')}\``
}
