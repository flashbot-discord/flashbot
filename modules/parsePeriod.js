module.exports = (periodText) => {
  // 1d2h3m4s 

  // days
  const daysSplit = periodText.split('d')
  let days = parse(daysSplit)
  if (days == null) return null

  periodText = getSlicedPeriodText(daysSplit)

  // hours
  const hoursSplit = periodText.split('h')
  let hours = parse(hoursSplit)
  if (hours == null) return null

  periodText = getSlicedPeriodText(hoursSplit)

  // minutes
  const minutesSplit = periodText.split('m')
  let minutes = parse(minutesSplit)
  if (minutes == null) return null

  periodText = getSlicedPeriodText(minutesSplit)

  // seconds
  const secondsSplit = periodText.split('s')
  let seconds = parse(secondsSplit)
  if (seconds == null) return null

  periodText = getSlicedPeriodText(secondsSplit)

  // It should not have remaining text
  if (periodText.length > 0) return null

  // Calculate
  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60)
    seconds %= 60
  }

  if (minutes >= 60) {
    hours += Math.floor(minutes / 60)
    minutes %= 60
  }

  if (hours >= 24) {
    days += Math.floor(hours / 24)
    hours %= 24
  }

  return {
    days,
    hours,
    minutes,
    seconds
  }
}

function parse(split) {
  if (split.length === 1) return 0
  else if (split.length !== 2) return null
  const num = Number(split[0])
  if (!Number.isInteger(num) && num !== Infinity) return null

  return num
}

function getSlicedPeriodText (slice) {
  if (slice.length < 2) return slice[0]
  else return slice[1]
}
